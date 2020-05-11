## SNMP Setup


### Install following packages

`yum -y install net-snmp net-snmp-utils`


### Configuration 

Open `/etc/snmp/snmpd.conf`
replace content of the file with the following:

```
# `public` is the community key
# use something else if you wish and remember it for later use
com2sec AllUser default public
group AllGroup v2c AllUser
view AllView included .1
access AllGroup "" any noauth exact AllView none none
```

### Restart Service and set to auto-run:

`service snmpd restart`

`chkconfig snmpd on`


### Test:

`snmpwalk -v 2c -c <community> 127.0.0.1 .1.3.6.1.4.1.2021.11.50.0`

`snmpwalk -v 2c -c <community> 127.0.0.1 .1.3.6.1.4.1.2021.4.6.0`

replace `<community>` with the community key from the configuration phase
`public` by default

If integer results are seen then SNMP is functioning properly. 


### Configure Firewall:
```
firewall-cmd --permanent --zone=public --add-port=161/udp
firewall-cmd --permanent --zone=public --add-port=162/udp
firewall-cmd --reload
firewall-cmd --list-all
```
### References

- Centos 7: https://www.liquidweb.com/kb/how-to-install-and-configure-snmp-on-centos/

- RedHat: https://access.redhat.com/documentation/en-US/Red_Hat_Enterprise_Linux/6/html/Deployment_Guide/sect-System_Monitoring_Tools-Net-SNMP.html#sect-System_Monitoring_Tools-Net-SNMP-Installing