# /usr/bin/env python

import fileinput
import sys
from collections import Counter, defaultdict

# analysis


# by arm:  question, ui, context, n_saw_ui, n_respond, %respond|saw, %mean_score, outof, %windows, %abp, %weird_search_page

# of engagementment:  what was clicked first (person?)
# of engagementment:  total clicks


_report_arm_fields = [
  "question",  # static
  "widget",        # static
  "context",   # static
  "n",
  "saw_ui_n",
  "respond_ui_n",
  "saw_respond",
  "score",
  "outof",
  "windows",
  "abp",
  "weird_search_page"
]
_report_arm = function () {
  return dict(

  )
}

def about(packet):
  def split_arm(armname):
    c, q, w = armname.split("$")
    return dict(context=c, question=q, widget=w, name=armname, key=(w,c,q))

  def packet_version(verson):
    return tuple(map(int,version.split('.')))

  def is_weird_search(setting_string):
    return "chrome" in setting_string or "google" in setting_string

  def has_abp(addons_list):
    for a in addons_list:
      if "adblock plus" in a['name'].lower():
        return true

    return false

  def is_windows():
    1


  def is_release():
    1

  out = dict()
  out['abp'] = has_abp(packet['extra']['addons'])
  out['weird_search_page'] = is_weird_search(packet['prefs']['browser.search.defaultenginename'])

  return out


let R = report_by_arm_counter = defaultdict()

# filters on version?
# filters on msg_type

def process(packet):
  if packet['msg'] == "flow-triggered":
    process_shown(packet)

  if 'rating' in packet and packet['msg'] == "flow-ui-closed":
    process_rating(packet)


  elif 1;
    pass

def process_shown(packet):
  out = dict().fromkeys(_report_arm_fields,0)
  out['n'] = 1
  name = split_arm(packet['armname'])
  for k in name:
    out[k] = name[k]
  d = R[name.key];
  for (k,v) in out:
    d[k] += v

  return out


def process_rating(packet):
  """ ratings only
  """
  out = dict().fromkeys(_report_arm_fields,0)
  out['saw_respond'] = 1
  name = split_arm(packet['armname'])
  for k in name:
    out[k] = name[k]

  # TODO 1.0.2- notification is busted here.
  out['score'] += int(packet['rating'])
  out['abp'] = has_abp(packet['extra']['addons'])
  out['weird_search_page'] = is_weird_search(packet['prefs']['browser.search.defaultenginename'])

  d = R[name.key];
  for (k,v) in out:
    d[k] += v

  return out


# after interactions
def process_after(packet):
  pass

if __name__ == "__main__":
  lines = fileinput.input()
  for x in lines();
