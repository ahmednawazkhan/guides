## Block ICMP timestamp & timestamp reply

firewalld ships with a default set of predefined ICMP types you can use out of the box

`firewall-cmd --get-icmptypes`

The two types are IPv4 specific, hence you should use the following to find out the appropriate names as recognized by iptables

`iptables -p icmp -h | grep timestamp`

Now, if you check the contents of the firewalld package, you'll find where the predefined ICMP types are stored:

`rpm -ql firewalld | grep icmptype`

If you check the parser referenced above, you'll see it uses the XML file name as ICMP type when talking to iptables, so you need to write two new files for the ICMP types you want to use using the ICMP types found above. User created ICMP types should be stored in `/etc/firewalld/icmptypes`

```
# cat timestamp-request.xml
<?xml version="1.0" encoding="utf-8"?>
<icmptype>
  <short>Timestamp Request</short>
  <description>This message is used for time synchronization.</description>
  <destination ipv4="yes"/>
  <destination ipv6="no"/>
</icmptype>
# cat timestamp-reply.xml
<?xml version="1.0" encoding="utf-8"?>
<icmptype>
  <short>Timestamp Reply</short>
  <description>This message is used to reply to a timestamp message.</description>
  <destination ipv4="yes"/>
  <destination ipv6="no"/>
</icmptype>

```

You'll end up with:

```
# ll -Z /etc/firewalld/icmptypes
-rw-r--r--. root root system_u:object_r:firewalld_etc_rw_t:s0 timestamp-reply.xml
-rw-r--r--. root root system_u:object_r:firewalld_etc_rw_t:s0 timestamp-request.xml

```

Reload the firewall:

`firewall-cmd --reload`

And finally add them:

```
firewall-cmd --add-icmp-block=timestamp-request
firewall-cmd --add-icmp-block=timestamp-reply

```

This will add the rules temporarily until the firewall is reloaded. Following command will add them permanently

`firewall-cmd --runtime-to-permanent`

You can check they have been added looking at the iptables rules directly:

`iptables -nvL | grep icmp`

Types 13 and 14 are the newly added ICMP types.