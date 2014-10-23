# /usr/bin/env python

from __future__ import division

"""
Version specific notes:
1.0.2:  First 'wide release'
1.0.3:
  Fixes:
  - feedback on 'after' instrumented (was missing)
  - notification box ratings are accurate.



"""

import fileinput
import sys
from collections import defaultdict
try:
  from colletions import Counter
except:
  def Counter():
    return defaultdict(int)

import logging

try:
  import ujson as json
except:
  import json

import json as ojson

# analysis


# links:
links = Counter()

# by arm:  question, ui, context, n_saw_ui, n_respond, %respond|saw, %mean_score, outof, %windows, %abp, %weird_search_page

# of engagementment:  what was clicked first (person?)
# of engagementment:  total clicks



_sumup_fields = [
  #"question",  # static
  #"widget",        # static
  #"context",   # static
  "ui_started_n",
  "ui_seen_n",
  "ui_vote_n",
  "ui_reject_n",

  # gotta do some things for the fouled scoring the bottom bar.
  # not sure best way to handle it.
  "ui_vote_adjusted_n",
  "score_sum_adjusted",
  "score_sum_sq",

  "score",
  "outof",
  "windows",
  "abp",
  "weird_search_page",
  "engage"
]

## utilities
def split_arm(armname):
  c, q, w = armname.split("$")
  armkey = tuple([w, c, q])
  return dict(context=c, question=q, widget=w, armname=armname, armkey=armkey)

def packet_version(version):
  return tuple(map(int,version.split('.')))

def search_provider(setting_string):
  """ return (category, provider) """
  s = setting_string.lower()
  p = None
  if "chrome" in s or "google" in s:
    p = "google"
  elif "yahoo" in s:
    p = 'yahoo'
  elif "duck" in s or "ddg" in s:
    p = 'ddg'
  elif "bing" in s:
    p = "bing"
  else:
    p = "weird"

  c = p
  if p not in ('google', 'weird'):
    c = 'other'

  return (c, p)

def has_abp(addons_list):
  if not addons_list:
    return False

  for a in addons_list:
    if "adblock plus" in (a.get('name',"") or "").lower():
      return True

  return False

# TODO
def is_windows():
  return True

#TODO
def is_release(pref):
  return pref.lower().strip() == 'release'


def about(packet):
  #out = dict().fromkeys(_sumup_fields,0)
  out = dict()
  n =  split_arm(packet.get('armname', None) or packet['extra']['armname'])

  for k in n:
    out[k] = n[k]

  out['msg'] = packet.get('msg', None) or packet['extra'].get('msg', None) or ""
  out['version'] = packet_version(packet['extra'].get('addonVersion','0.0.0'))
  out['versionstring'] = packet['extra'].get('addonVersion','0.0.0')

  out['abp'] = has_abp(packet['extra']['addons'])
  #out['windows'] = is_windows()  # TODO Forgot to collect
  out['release'] = is_release(packet['extra'].get('updateChannel',""))

  # fix 1.0.2 bug that missed 'link-feedback'
  _link = ['','link-feedback'][out['msg']=="afterPage-link"]
  out['link'] = packet.get('link',_link)
  out['firstrunts'] = int(packet['extra'].get('firstrunts'))
  out['ts'] = int(packet['extra'].get('ts'))

  crashes = packet['extra'].get('crashes', None)
  if crashes:
    out['crashes'] = crashes
    out['crashed'] = out['crashes']['total'] > 0

  out['profileage'] = packet['extra']['profileage']
  out['profile1month'] = out['profileage'] > 30
  out['profile1year'] = out['profileage'] > 365

  out['addons'] = packet['extra']['addons']

  search = search_provider(packet['extra']['prefs']['browser.search.defaultenginename'])
  out['search_provider'] = search[1]
  out['search_cat'] = search[0]

  return out


def reported_default():
  d = dict().fromkeys(_sumup_fields,0)
  d['ratings'] = defaultdict(int)
  return d

R = report_by_arm_counter = defaultdict(reported_default)

# filters on version?
# filters on msg_type


def process(packet):
  if packet.get('testing'):
    return False

  p = about(packet)

  if p['version'] < (1,0,1):
    return False

  d = R[p['armkey']]
  msg = p['msg']

  #print msg

  def sumup(thing):
    for k in _sumup_fields:
      if k in thing:
        d[k] += thing[k]

  # different messages

  if msg == 'flow-started':
    d['ui_started_n'] += 1
    sumup(about(packet))  # demographics!

  elif msg == "flow-triggered":
    d['ui_seen_n'] += 1

  # TODO, needs fixing for stuff in 1.0.4 tbd
  elif 'rating' in packet and msg in ["flow-ui-closed", ""]:
    rating = int(packet['rating'])
    d['score'] += rating
    d['ui_vote_n'] += 1

    # unless!  notifications from 1.0.2 shouldn't count
    if p['widget'].startswith("notification") and p['version'] < (1,0,3):
      pass
      # nope
    else:
      d['score_sum_adjusted'] += rating
      d['ratings'][rating] += 1

      d['score_sum_sq'] += rating **2
      d['ui_vote_adjusted_n'] += 1

  elif msg in ["flow-ui-refused", "flow-ux-refused"]:
    d['ui_reject_n'] += 1

  elif msg == "afterPage-link":
    d['engage'] += 1
    links[p['link']] += 1

  return True

def print_report(R):
  keys = ['w', 'c', 'q', '%vote', 'mean_score', 'error', 'n_voted', 'n_valid_votes', '%refuse', 'n_seen', 'engage:vote', '%3less-rating', '%5rating']
  print "\t".join(keys)
  for k, v in sorted(R.iteritems()):
    mean_n = (v['ui_vote_adjusted_n'] or 1)
    mean = v['score_sum_adjusted'] / mean_n
    ss_mean = v['score_sum_sq'] - (v['score_sum_adjusted']**2 / mean_n)
    sample_var_mean = ss_mean/((mean_n - 1) or .00000000001) # huge means undef
    se_mean = (sample_var_mean / mean_n) ** .5

    vote_or_reject = (sum(v['ratings'].values()) + v['ui_reject_n']) or 1
    r3_or_less = v['ratings'][1] + v['ratings'][2] + v['ratings'][3] # ratings <= 3
    o = list(k)
    o.extend([
     "{0:4.02%}".format(v['ui_vote_n']
      / (v['ui_seen_n'] or 1)),
     "{0:4.02f}".format(mean), # handle the zero case
     "{0:4.02f}".format(se_mean),
     "{0:4.0f}".format(v['ui_vote_n']),
     "{0:4.0f}".format(mean_n),

     "{0:4.02%}".format(v['ui_reject_n']
      / (v['ui_seen_n'] or 1)), # handle the zero case
      str(v['ui_seen_n']),
     "{0:5.02}".format(v['engage']
      / (v['ui_vote_n'] or 1)), # handle the zero case
     "{0:4.0%}".format(r3_or_less / vote_or_reject), # handle the zero case
     "{0:4.0%}".format(v['ratings'][5]/ vote_or_reject) # handle the zero case
    ])
    print "\t".join(o)


def make_dataset(f,R):

  ## TODO, longform dataset for csv
  # (responded) = arm, rated, rating, abp, crashever
  # (score) = arm, rated, rating, abp, crashever?
  # engage?

  with open(f,"w") as fh:
    for (k, v) in R.iteritems:
      row = list(k)
      ## repeat lots?
      for ii in row['started']:
        pass


if __name__ == "__main__":
  lines = fileinput.input()
  for (ii,x) in enumerate(lines):
    try:
      packet = json.loads(x.strip())
      process(packet)
    except Exception as exc:
      logging.error(x)
      logging.exception(exc)


  #for (k,v) in sorted(links.iteritems()):
  #  print (k,v)

  with open("report1.json", 'w') as fh:
    n = dict()
    n['links'] = links
    n['report'] = dict()

    for (k,v) in sorted(R.iteritems()):
      r = dict(v);
      key = '$'.join(map(str,k))
      r['widget'] = k[0]
      r['context'] = k[1]
      r['question'] = k[2]
      n['report'][key] = r

    fh.write(ojson.dumps(n, indent=2))

  print_report(R)
