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
  "score_adjusted_n",

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

def is_weird_search(setting_string):
  return "chrome" in setting_string or "google" in setting_string

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
  out = dict().fromkeys(_sumup_fields,0)
  n =  split_arm(packet.get('armname', None) or packet['extra']['armname'])

  for k in n:
    out[k] = n[k]

  out['msg'] = packet.get('msg', None) or packet['extra'].get('msg', None) or ""

  out['version'] = packet_version(packet['extra'].get('addonVersion','0.0.0'))
  out['abp'] = has_abp(packet['extra']['addons'])
  out['weird_search_page'] = is_weird_search(packet['extra']['prefs']['browser.search.defaultenginename'])
  out['windows'] = is_windows()  # TODO Forgot to collect
  out['release'] = is_release(packet['extra'].get('updateChannel',""))
  out['link'] = packet.get('link','')
  return out


R = report_by_arm_counter = defaultdict(lambda: dict().fromkeys(_sumup_fields,0))

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
    d['score'] += int(packet['rating'])
    d['ui_vote_n'] += 1

    # unless!  notifications from 1.0.2 shouldn't count
    if p['widget'].startswith("notification") and p['version'] < (1,0,3):
      # nope
    else:
      d['score_adjusted_n'] += int(packet['rating'])
      d['ui_vote_adjusted_n'] += 1

  elif msg in ["flow-ui-refused", "flow-ux-refused"]:
    d['ui_reject_n'] += 1

  elif msg == "afterPage-link":
    d['engage'] += 1
    links[p['link']] += 1

  return True

def print_report(R):
  keys = ['w', 'c', 'q', '%vote', 'mean_score', 'n_voted', '%refuse', 'n_seen', 'engage:vote']
  print "\t".join(keys)
  for k, v in sorted(R.iteritems()):
    o = list(k)
    o.extend([
     "{0:4.02%}".format(v['ui_vote_n']
      / (v['ui_seen_n'] or 1)),
     "{0:4.02f}".format(v['score_adjusted_n']
      / (v['ui_vote_adjusted_n'] or 1)), # handle the zero case
     "{0:4.02%}".format(v['ui_reject_n']
      / (v['ui_seen_n'] or 1)), # handle the zero case
      str(v['ui_seen_n']),
     "{0:5.02}".format(v['engage']
      / (v['ui_vote_n'] or 1)), # handle the zero case
    ])
    print "\t".join(o)


if __name__ == "__main__":
  lines = fileinput.input()
  for (ii,x) in enumerate(lines):
    try:
      packet = json.loads(x.strip())
      process(packet)
    except Exception as exc:
      logging.error(x)
      logging.exception(exc)


  ## TODO, longform dataset for csv
  # (responded) = arm, rated, rating, abp, crashever
  # (score) = arm, rated, rating, abp, crashever?
  # engage?


  for (k,v) in sorted(links.iteritems()):
    print (k,v)

  for (k,v) in sorted(R.iteritems()):
    print (k, v)

  print_report(R)
