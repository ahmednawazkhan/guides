## Extending the SNMP Agent. Custom Script, Custom MIB, Custom Enterprise OID

*please install snmp agent using the guide **snmp-setup** in the same folder*

## Creating a MIB

### What is an MIB

When you use snmpget, an SNMP request is made via IP to an SNMP agent on a remote (or local) host to return a specific piece of data. A MIB is used to describe in human readable terms, what that data is and where to find it. On the other hand, `snmptranslate` is a tool used to parse a given MIB. It parses a local MIB file, and doesn't make any contact with an agent.


execute following command to see where the mibs are hosted

`net-snmp-config --default-mibdirs`

my output was 
```
/root/.snmp/mibs:/usr/share/snmp/mibs

```

Lets create our first mib 

inside `/usr/share/snmp/mibs` folder create a file named `GET-LATEST-SIGNALS-MIB.txt` and add following content to it 

```

GET-LATEST-SIGNALS-MIB DEFINITIONS ::= BEGIN

IMPORTS
    MODULE-IDENTITY, OBJECT-TYPE, enterprises FROM SNMPv2-SMI
;

signalsInfo MODULE-IDENTITY
    LAST-UPDATED "202005100000Z"
    ORGANIZATION "Afiniti, Inc"
    CONTACT-INFO    
         "postal:   Ahmed @ afiniti

          email:    ahmed.nawazkhan@afiniti.com"
    DESCRIPTION
        "This Mib module defines objects for signal statistics"
    REVISION     "202005100000Z"
    DESCRIPTION
        "Corrected notification example definitions"
    REVISION     "200202060000Z"
    DESCRIPTION
        "First draft"
    ::= { enterprises 53864 }

--
-- top level structure
--
latestSignalValue       OBJECT IDENTIFIER ::= { signalsInfo 1 }

--
-- Example scalars
--

oversightInteger OBJECT-TYPE
    SYNTAX      OCTET STRING
    MAX-ACCESS  read-only
    STATUS      current
    DESCRIPTION
        "the latest value of signal"
    DEFVAL { "hello" }
    ::= { latestSignalValue 1 }


END
```

__The module name and file name should be same to ensure that the SNMP parser can find the dependent MIB__


lets verify that using snmptranslate  that doesn't yet know about this node

`snmptranslate -IR -On oversightInteger Unknown object identifier: oversightInteger`


then lets do

`snmptranslate -m +GET-LATEST-SIGNALS-MIB -IR -On oversightInteger`

i got the output

`.1.3.6.1.4.1.53864.1.1`

snmptranslate is just the parser. The mib file is not yet loaded. to load the mib file every time `snmpd` starts, add 

`+mibs +GET-LATEST-SIGNALS-MIB`

to your `/etc/snmp/snmp.conf`

__Note that the value for this variable is the name of the MIB module, *not* the name of the MIB file.__


In order to add new functionality to an SNMP agent the agent must be extended. If you're using Net-SNMP, there are a few options including compiling new source code into the agent, using a sub-agent, and using external scripts via pass and pass-persist protocol. Take a look at:

https://vincent.bernat.ch/en/blog/2012-extending-netsnmp


we will be using the `pass` protocol

Let us create our first script. Create `/etc/snmp/exampleScript.sh` and add the following content to it 

```

#!/bin/sh -f

PLACE=".1.3.6.1.4.1.53864.1.1"
REQ="$2"    # Requested OID

#
#  Process SET requests by simply logging the assigned value
#      Note that such "assignments" are not persistent,
#      nor is the syntax or requested value validated
#  
if [ "$1" = "-s" ]; then
  echo $* >> /tmp/passtest.log
  exit 0
fi

#
#  GETNEXT requests - determine next valid instance
#
if [ "$1" = "-n" ]; then
  case "$REQ" in
    $PLACE|             \
    $PLACE.0|           \
    $PLACE.0.*|         \
    $PLACE.1)       RET=$PLACE.1.0 ;;     # netSnmpPassString.0

    $PLACE.1.*|         \
    $PLACE.2|           \
    $PLACE.2.0|         \
    $PLACE.2.0.*|       \
    $PLACE.2.1|         \
    $PLACE.2.1.0|       \
    $PLACE.2.1.0.*|     \
    $PLACE.2.1.1|       \
    $PLACE.2.1.1.*|     \
    $PLACE.2.1.2|       \
    $PLACE.2.1.2.0) RET=$PLACE.2.1.2.1 ;; # netSnmpPassInteger.1

    $PLACE.2.1.2.*|     \
    $PLACE.2.1.3|       \
    $PLACE.2.1.3.0) RET=$PLACE.2.1.3.1 ;; # netSnmpPassOID.1

    $PLACE.2.*|         \
    $PLACE.3)       RET=$PLACE.3.0 ;;     # netSnmpPassTimeTicks.0
    $PLACE.3.*|         \
    $PLACE.4)       RET=$PLACE.4.0 ;;     # netSnmpPassIpAddress.0
    $PLACE.4.*|         \
    $PLACE.5)       RET=$PLACE.5.0 ;;     # netSnmpPassCounter.0
    $PLACE.5.*|         \
    $PLACE.6)       RET=$PLACE.6.0 ;;     # netSnmpPassGauge.0

    *)              exit 0 ;;
  esac
else
#
#  GET requests - check for valid instance
#
  case "$REQ" in
    $PLACE.1.0|         \
    $PLACE.2.1.2.1|     \
    $PLACE.2.1.3.1|     \
    $PLACE.3.0|         \
    $PLACE.4.0|         \
    $PLACE.5.0|         \
    $PLACE.6.0)     RET=$REQ ;;
    *)              exit 0 ;;
  esac
fi

#
#  "Process" GET* requests - return hard-coded value
#
echo "$RET"
case "$RET" in
  $PLACE.1.0)     echo "string";    echo "Life, the Universe, and Everything"; exit 0 ;;
  $PLACE.2.1.2.1) echo "integer";   echo "42";                                 exit 0 ;;
  $PLACE.2.1.3.1) echo "objectid";  echo "$PLACE.99";                          exit 0 ;;
  $PLACE.3.0)     echo "timeticks"; echo "363136200";                          exit 0 ;;
  $PLACE.4.0)     echo "ipaddress"; echo "127.0.0.1";                          exit 0 ;;
  $PLACE.5.0)     echo "counter";   echo "42";                                 exit 0 ;;
  $PLACE.6.0)     echo "gauge";     echo "42";                                 exit 0 ;;
  *)              echo "string";    echo "ack... $RET $REQ";                   exit 0 ;;  # Should not happen
esac


```

add the following line to `snmpd.conf`

`pass .1.3.6.1.4.1.53864.1.1 /bin/sh /etc/snmp/exampleScript.sh`

Now my `snmpd.conf` is 

```

com2sec AllUser default public
group AllGroup v2c AllUser
view AllView included .1
access AllGroup "" any noauth exact AllView none none

rocommunity public localhost
rwcommunity public localhost

pass .1.3.6.1.4.1.53864.1.1 /bin/sh /etc/snmp/exampleScript.sh

```

once everything is done, start snmpd in debug mode in foreground as 

`snmpd -f -Lo -Ducd-snmp/pass`.




if you want to know the difference between `pass`, `extend`, `exec`, `sh`, `pass_persist` have a look at
http://net-snmp.sourceforge.net/wiki/index.php/FAQ:Agent_07


FAQs http://www.net-snmp.org/FAQ.html#How_do_I_add_a_MIB_

Thanks !!. Feel free to edit and improve