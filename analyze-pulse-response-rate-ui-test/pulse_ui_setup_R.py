#! /usr/bin/env python

from __future__ import division, print_function

import pdb

import fileinput
try:
  import ujson as json
except:
  import json

import logging
logging.root.setLevel(20)

from collections import defaultdict

import codecs
import re
import sys
import csv
import time

#UTF8Writer = codecs.getwriter('utf8')
#sys.stdout = UTF8Writer(sys.stdout)

import pulse_ui_test_report as utils

#http://stackoverflow.com/questions/11384589/what-is-the-correct-regex-for-matching-values-generated-by-uuid-uuid4-hex
def valid_uuid(uuid):
    # difference is in the 3rd group.
    regex = re.compile("""
      ^[a-f0-9]{8}-?   #
      [a-f0-9]{4}-?    #
      [a-f0-9]{4}-?    # 3rd group.  https://bugzilla.mozilla.org/show_bug.cgi?id=801950
      [89ab][a-f0-9]{3}-?   # 8,9,a,b  + 3
      [a-f0-9]{12}\Z""", re.I|re.VERBOSE)

    # too fancy, ours aren't uuid4
    #regex = re.compile('^[a-f0-9]{8}-?[a-f0-9]{4}-?4[a-f0-9]{3}-?[89ab][a-f0-9]{3}-?[a-f0-9]{12}\Z', re.I)
    match = regex.match(uuid)
    return bool(match)


allphases = defaultdict(lambda: defaultdict(int))

flow_keys = ['f-started','f-triggered', 'f-closed', 'f-engage', 'final-status', 'rating'] # final status?
flows = defaultdict(lambda:  dict().fromkeys(flow_keys,0))

#def decide_final_status(flowdict):
#  pass


curflowid = None
prev = (None, None)

def checksort(packet):
  global prev
  person = packet['extra']['person']
  ts = packet['extra']['ts']

  linekey = (person, ts)
  if linekey < prev:
    raise Exception("lines must be sorted by person, ts!")
  else:
    prev = linekey

def reset_flowid(packet, prev_person):
  global curflowid
  person = packet['extra']['person']
  ts = packet['extra']['ts']
  if person != prev_person:
    logging.info("new person %s %s", person, prev_person)
    curflowid = None

def process(packet, flowid):
  global curflowid
  person = packet['extra']['person']

  # excludes
  if packet.get('testing'):
    return False  # skip testing

  # process!
  p = utils.about(packet)
  if p['version'] < (1,0,1):
    return False

  k = packet.get('flowid', None)
  #logging.info(k)
  if (k and not valid_uuid(str(k))):
    k = None

  if not k:
    k = flowid
    if not k:
      logging.warn("no flowid seen yet! %s %s", person, prev)
      return
    else:
      logging.info("recovered flow %s %s", k, prev)
  else:
    logging.info("setting curflowid %s %s", k, prev)
    curflowid = k # set the global

  flows[k].update(p)
  my = flows[k]
  my['person'] = person

  my.setdefault('links',[])
  my.setdefault('nlinks', 0)
  my.setdefault('firstlink', '')

  msg = p['msg']
  ts = p['ts']
  logging.info(msg)

  if 'rating' in packet:
    if not p['widget'].startswith("notification"):
      pass
      #pdb.set_trace()
      #print("RATING", p['widget'], '|%s|' % (msg))

  # different messages
  if msg == 'flow-started':
    my['f-started'] = ts

  elif msg == "flow-triggered":
    my['f-triggered'] = ts

  # TODO, needs fixing for stuff in 1.0.4 tbd
  elif 'rating' in packet and msg in ["flow-ui-closed", ""]:
    my['f-closed'] = ts

    rating = int(packet['rating'])
    #print("RATING2", rating, p['widget'])
    my['raw_rating'] = rating
    my['rated'] = True
    my['rating_accurate'] = False

    # unless!  notifications from 1.0.2 shouldn't count
    if p['widget'].startswith("notification") and p['version'] < (1,0,3):
      pass # dont use!
    else:
      my['rating'] = rating
      my['rating_accurate'] = True

  elif msg in ["flow-ui-refused", "flow-ux-refused"]:
    my['rejected'] = True

  elif msg == "afterPage-link":
    my['links'].append([p['link'], ts])
    my.setdefault('nlinks', 0)
    my['nlinks'] += 1
    my['firstlink'] = my['links'][0][0] # just in case!
    my['f-engage'] = my['links'][0][1]

  flows[k] = my

def reformat_flow(flow):
  for k,v in flow.iteritems():
    if isinstance(v,tuple):
      flow[k] = list(v)

  return flow


csv_keys = [
    'flow',
    'armname',
    'context',
    'widget',
    'question',
    'versionstring',

    # success
    'firstrunts',
    'f-started',
    'f-triggered',
    'f-closed',
    'f-engage',
    'firstlink',
    'nlinks',
    'rating',
    'rating_accurate',
    'raw_rating',
    'rejected',
    ## styem
    'abp',
    #'addons',
    #'armkey',
    'crashed',
    #'crashes',
    #'final-status',
    #'links',
    # 'msg',
    'person',
    'profile1month',
    'profile1year',
    'profileage',
    'release',
    'search_cat',
    'search_provider',

    # derived keys
    'search_weird',
    'rated'
  ]


def main(lines):
  # ugh, eat a full memory sort here to work with missing flowid stuff.
  ### sorted(map(json.loads, lines),
  for (ii,line) in enumerate(lines):
    x = json.loads(line.rstrip())
    try:
      prev_person = prev[0]  #must be first!
      packet = x
      reset_flowid(packet, prev_person)
      checksort(packet)  # sets 'prev', by sideffect
      process(packet, curflowid)
    except Exception as exc:
      logging.error("line %i", ii)
      logging.error(x)
      logging.exception(exc)

  begin = time.time()
  logging.info("begin %s", begin)

  def boolcsv(thing):
    if isinstance(thing, bool):
      return ["FALSE","TRUE"][thing]
    else:
      return thing

  with open("pulse.experiment.data.csv", "wb") as outcsv:
    T = csv.DictWriter(outcsv,fieldnames=csv_keys)
    T.writerow(dict(zip(T.fieldnames, T.fieldnames)))
    with open("pulse.experiment.data.json.lines", "wb") as outjson:
      for (ii, (k, v)) in enumerate(flows.iteritems()):
        pass
        # json!
        v['flow'] = k
        oj = reformat_flow(v)

        #print (k, reformat_flow(v))
        if not ii % 1000:
          logging.info("flow % 10d % 3.3f", ii, time.time() - begin)

        # json
        outjson.write(json.dumps(oj) + "\n")

        # csv
        d = dict()
        d = dict(((c,boolcsv(v.get(c,""))) for c in csv_keys))
        # some nit fixes
        d['raw_rating'] = int(d['raw_rating'] or 0)
        d['rating_accurate'] = boolcsv(bool(d['rating_accurate']))
        d['search_weird'] = boolcsv(d['search_cat'] == "weird")
        d['rated'] = boolcsv(d['raw_rating'] > 0)
        d['rejected'] = d['rejected'] or 'FALSE'
        T.writerow(d)

  #print (allphases)


def decorate_and_dump(lines):
  lines = ((json.loads(x.strip()), x.decode('utf8'), ii) for (ii,x) in enumerate(lines,1))
  for x, line, orig_ii in lines:
    try:
      s = u"\t".join(
        [(x['extra']['person']),
        str(x['extra']['ts']),
        line
      ])
    except KeyError:
      logging.error("line %i no person\t%s", orig_ii, line)

    sys.stdout.write(s.encode('utf8'))

if __name__ == '__main__':
  import argparse
  parser = argparse.ArgumentParser()
  parser.add_argument('--decorate', action='store_true',
                     help='sort the lines by (person,ts), and push them back out to `lines.sorted.txt`, then exit.')

  args, leftover = parser.parse_known_args()
  if args.decorate:
    decorate_and_dump(fileinput.input(leftover))
  else:
    main(fileinput.input())

