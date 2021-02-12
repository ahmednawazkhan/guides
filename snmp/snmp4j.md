## Sending Trap in SNMP4j

```
try {
            Address targetAddress = GenericAddress.parse("udp:10.32.7.170/" + 1166);
            TransportMapping<?> transport = new DefaultUdpTransportMapping();
            Snmp snmp = new Snmp(transport);
            USM usm = new USM(SecurityProtocols.getInstance(), new OctetString(
                    MPv3.createLocalEngineID()), 0);
            SecurityModels.getInstance().addSecurityModel(usm);
            transport.listen();
            SecurityProtocols.getInstance().addPrivacyProtocol(new PrivAES128());
            SecurityProtocols.getInstance().addAuthenticationProtocol(new AuthSHA());
    
            snmp.getUSM().addUser(
                    new OctetString("ovuser"),
                    OctetString.fromString("8000000001020304", 16),
                    new UsmUser(new OctetString("ovuser"), AuthSHA.ID, new OctetString("secret12"),
                            PrivAES128.ID, new OctetString("secret12")));
    
            // Create Target
            UserTarget target = new UserTarget();
            target.setAddress(targetAddress);
            target.setRetries(1);
            target.setTimeout(11500);
            target.setVersion(SnmpConstants.version3);
            target.setSecurityLevel(SecurityLevel.AUTH_PRIV);
            target.setSecurityName(new OctetString("ovuser"));
            
    
            // Create PDU for V3
            ScopedPDU pdu = new ScopedPDU();
            pdu.setType(ScopedPDU.NOTIFICATION);
            pdu.add(new VariableBinding(SnmpConstants.sysUpTime));
            pdu.add(new VariableBinding(SnmpConstants.snmpTrapOID, SnmpConstants.linkDown));
            pdu.add(new VariableBinding(new OID("1.2.3.4.5"), new OctetString("Major")));
    
            snmp.setLocalEngine(OctetString.fromString("8000000001020304", 16).getValue(), 0, 0);
            // Send the PDU
            snmp.send(pdu, target);
    
            transport.close();
            snmp.close();
        } catch (Exception e) {
            System.err.println("Error in Sending Trap to (IP:Port)=> " + "127.0.0.1" + ":" + "1166");
            System.err.println("Exception Message = " + e.getMessage());
        }

```