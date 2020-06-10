## Extending the SNMP Agent. Custom Script, Custom MIB, Custom Enterprise OID

_please install snmp agent using the guide **snmp-setup** in the same folder_

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

**The module name and file name should be same to ensure that the SNMP parser can find the dependent MIB**

In order to validate the MIB structure install `libsmi`. On Centos

`yum install libsmi`

It will provide you with a tool called `smilint`

Check the Mib file using command

`smilint /usr/share/snmp/mibs/GET-LATEST-SIGNALS-MIB.txt`

**Please read the book _Essential SNMP 2nd Edition_ to under stand _SMI_ and _MIB_ structures**

lets verify using `snmptranslate` that doesn't yet know about this node

`snmptranslate -IR -On oversightInteger`

output

`Unknown object identifier: oversightInteger`

then lets do

`snmptranslate -m +GET-LATEST-SIGNALS-MIB -IR -On oversightInteger`

i got the output

`.1.3.6.1.4.1.53864.1.1`

`snmptranslate` is just the parser. The mib file is not yet loaded. To load the mib file every time `snmpd` starts, add

`+mibs +GET-LATEST-SIGNALS-MIB`

to your `/etc/snmp/snmp.conf`

**Note that the value for this variable is the name of the MIB module, _not_ the name of the MIB file.**

## Method 1 (Pass Protocol)

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

execute the command

`snmpwalk -v2c localhost -c public .1.3.6.1.4.1.53864`

you should see

```
GET-LATEST-SIGNALS-MIB::oversightInteger.1.0 = STRING: "Life, the Universe, and Everything"
GET-LATEST-SIGNALS-MIB::oversightInteger.2.1.2.1 = Wrong Type (should be OCTET STRING): INTEGER: 42
GET-LATEST-SIGNALS-MIB::oversightInteger.2.1.3.1 = Wrong Type (should be OCTET STRING): OID: GET-LATEST-SIGNALS-MIB::oversightInteger.99
GET-LATEST-SIGNALS-MIB::oversightInteger.3.0 = Wrong Type (should be OCTET STRING): Timeticks: (363136200) 42 days, 0:42:42.00
GET-LATEST-SIGNALS-MIB::oversightInteger.4.0 = Wrong Type (should be OCTET STRING): IpAddress: 127.0.0.1
GET-LATEST-SIGNALS-MIB::oversightInteger.5.0 = Wrong Type (should be OCTET STRING): Counter32: 42
GET-LATEST-SIGNALS-MIB::oversightInteger.6.0 = Wrong Type (should be OCTET STRING): Gauge32: 42

```

We are getting a few errors because our script output does not match our MIB which can be tailored anytime. The value we are interested in is

`Life, the Universe, and Everything`

which is coming from our script. You can see certain useful logs on the terminal where `snmpd` is running in the debug mode

**if you face any problem try the command `setenforce 0`**

## Method 2 (Dynnamic Object Loading)

Writing modules for MIBs is a long and sometimes troublesome process, much like writing a parser. And just like writing a parser, you don't have to do everything by hand: MIBs can already be processed by computers pretty well, so there is no need to start from square one every time. The tool to convert an existing MIB to some C code is called mib2c and is part of the Net-SNMP distribution
As now we are familiar with creation of mib file lets practice it. Let us create a new MIB file with an custom OID which will return a static string '6.1.1'. So our MIB file looks like this:

```
MY-COMPANY-MIB DEFINITIONS ::= BEGIN

IMPORTS
MODULE-IDENTITY, OBJECT-TYPE, enterprises, Integer32 FROM SNMPv2-SMI;

-- root of our MIB will point to enterprises

myCompanyMIB MODULE-IDENTITY
LAST-UPDATED
"202005100000Z"
ORGANIZATION
"AFINITI"
CONTACT-INFO
"email: support@afiniti.com"
DESCRIPTION
"Custom Example MIB"
REVISION
"202005100000Z"
DESCRIPTION
"First and hopefully not the final revision"
::= { enterprises 53864 }

-- lets group all scalarValues in one node of our MIB

scalarValues OBJECT IDENTIFIER ::= { myCompanyMIB 1 }

-- time to define scalar values

hostVersionString OBJECT-TYPE
SYNTAX OCTET STRING
MAX-ACCESS read-only
STATUS current
DESCRIPTION
"Static string software Version"
::= { scalarValues 1 }

END

```

Now run the following command in the same folder

```bash
$ mib2c scalarValues
```

Afterwards, you will be asked for some options to select. First select "Net-SNMP style code" which is option "2" and then select "If you're writing code for some generic scalars" i.e option "1".

After Successfully completing the above steps, it will generate two files in the same directory scalarValues.c and scalarValues.h. We will be writing all our code in scalarValues.c. We need to implement our driver functions and bind the values to scalar objects in the handler.

As we need to just bind the static string '6.1.1', Our handler code will look like this:

```c
int
handle_hostVersionString(netsnmp_mib_handler *handler,
                          netsnmp_handler_registration *reginfo,
                          netsnmp_agent_request_info   *reqinfo,
                          netsnmp_request_info         *requests)
{
    /* We are never called for a GETNEXT if it's registered as a
       "instance", as it's "magically" handled for us.  */

    /* a instance handler also only hands us one request at a time, so
       we don't need to loop over a list of requests; we'll only get one. */
    strcpy(softwareVersion, "6.1.1");
    switch(reqinfo->mode) {

        case MODE_GET:
            snmp_set_var_typed_value(requests->requestvb, ASN_OCTET_STR,
                                    (u_char*) &softwareVersion,
                                     strlen(softwareVersion));
            break;


        default:
            /* we should never get here, so this is a really bad error */
            snmp_log(LOG_ERR, "unknown mode (%d) in handle_hostVersionString\n", reqinfo->mode );
            return SNMP_ERR_GENERR;
    }

    return SNMP_ERR_NOERROR;
}
```

So we are almsot done, we need to compile the C code and place the dynamic loaded object in `/usr/lib` folder so our daemon can load our library when it starts. To do that run the following commands:

```bash
$ gcc -shared -fPIC scalarValues.c -o libSnmpHandler.so
$ sudo cp libSnmpHandler.so /usr/lib
```

Lets restart net-snmp daemon with following command and Try things out:

```
$ sudo /etc/init.d/snmpd restart
```

It's time to verify the things, lets call the snmpget command on our custom OID's:

```bash
snmpget -v 2c -c public localhost  1.3.6.1.4.1.53864.1.1.0
```

&nbsp;&nbsp;&nbsp;**Output:**

```bash
SNMPv2-SMI::enterprises.53864.1.1.0 = STRING: "6.1.1"
```

Hurray, We have finally made a custom snmp agent handling custom OIDs with Dynamically Loadable Objects.

## Method 3 (Using AgentX Protocol)

## What is AgentX Protocol?

The Agent Extensibility Protocol or AgentX is a computer networking protocol that allows management of Simple Network Management Protocol objects defined by different processes via a single master agent. Agents that export objects via AgentX to a master agent are called **subagents**.
So essentially, AgentX protocol allows a **master agent** to be extended by individual **subagents**.

Some of the benefits that AgentX has over other methods are:

1. No configuration is needed for the master agent to accept an additional sub-agent. A sub-agent registers to the master agent the MIB modules (or part of them) it wants to take care of.
2. A sub-agent is decoupled from the master agent. It can run with a different identity or be integrated into another daemon to export its internal metrics, send traps or allow remote configuration through SNMP.
3. AgentX protocol can be carried over TCP. Sub-agents can therefore run on a foreign host as well.

## Steps for making a master-agent

1. In order to make the NET-SNMP agent as a master agent, all you need to do is to **add** the following in your **snmpd.conf** file. The following tells the agent to open a TCP port at 705 for other sub-agents to connect to.

```bash
master agentx
agentXSocket    tcp:localhost:705
```

2. For these changes to take affect, you need to restart the snmpd service by executing the following in bash.

```
sudo service snmpd restart
```

## Steps for making a sub-agent

In order to make a sub-agent, you can choose any language of choice with relevant support to make a sub-agent. For the sake of this example, I'll be using JavaScript. I will be using [node-net-snmp](https://github.com/markabrahams/node-net-snmp) library through which we can create a sub-agent.

1. Create an app.js file and paste in the following content. Make sure you install **net-snmp** via npm. The following code exposes an OID of **1.3.6.1.4.1.53864.1.1.1** which is a scalar having the software version **6.1.1**.

```js
const snmp = require('net-snmp');

// Default options
const options = {
  master: 'localhost',
  masterPort: 705,
  description: 'Node net-snmp AgentX sub-agent'
};

const agent = snmp.createSubagent(options);
const mib = agent.getMib();

const softwareVersionProvider = {
  name: 'softwareVersion',
  type: snmp.MibProviderType.Scalar,
  oid: '1.3.6.1.4.1.53864.1.1.1',
  scalarType: snmp.ObjectType.OctetString,
  handler: function (mibRequest) {
    mibRequest.done();
  }
};

agent.open(function (error, data) {
  console.log('Successfully connected to master with PDU', data);
  if (error) {
    console.error(error);
  } else {
    agent.registerProvider(softwareVersionProvider, null);
    agent.getMib().setScalarValue('softwareVersion', '6.1.1');
    console.info(new Date(), 'SNMP sub-Agent is up and running..');
  }
});
```

2. Run the above code by node as follows. This will attach the sub-agent to master-agent at TCP port 705.

```bash
sudo node app.js
```

3. After this you can issue get request against this OID using **snmpget** as follows:

```bash
snmpget -v 2c -c public localhost 1.3.6.1.4.1.53864.1.1.1.0
```

&nbsp;&nbsp;&nbsp;You should get the following as an output on bash.

```
SNMPv2-SMI::enterprises.53864.1.1.1.0 = STRING: "6.1.1"
```

There you go, simple as that! You now have a sub-agent handling a custom OID which is connected to a NET-SNMP master agent.

### Useful Links

if you want to know the difference between `pass`, `extend`, `exec`, `sh`, `pass_persist` have a look at
http://net-snmp.sourceforge.net/wiki/index.php/FAQ:Agent_07

FAQs http://www.net-snmp.org/FAQ.html#How_do_I_add_a_MIB_

Thanks !!. Feel free to edit and improve
