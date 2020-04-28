## Disable Ping

### Permanent
in `/etc/sysctl.conf` append
`net.ipv4.icmp_echo_ignore_all = 1`

then run `sysctl -p`

## Save current firewall changes
`firewall-cmd --runtime-to-permanent`