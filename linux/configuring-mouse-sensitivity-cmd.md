# Command Line Instructions to Configure Mouse Sensitivity

1. list periphiral devices


`xinput --list --short`

sample output 

```
⎡ Virtual core pointer                    	id=2	[master pointer  (3)]
⎜   ↳ Virtual core XTEST pointer              	id=4	[slave  pointer  (2)]
⎜   ↳ SynPS/2 Synaptics TouchPad              	id=11	[slave  pointer  (2)]
⎜   ↳ TPPS/2 Elan TrackPoint                  	id=12	[slave  pointer  (2)]
⎜   ↳ Logitech Wireless Keyboard PID:4023     	id=14	[slave  pointer  (2)]
⎜   ↳ Logitech Wireless Mouse                 	id=16	[slave  pointer  (2)]
⎣ Virtual core keyboard                   	id=3	[master keyboard (2)]
    ↳ Virtual core XTEST keyboard             	id=5	[slave  keyboard (3)]
    ↳ Power Button                            	id=6	[slave  keyboard (3)]
    ↳ Video Bus                               	id=7	[slave  keyboard (3)]
    ↳ Sleep Button                            	id=8	[slave  keyboard (3)]
    ↳ Integrated Camera: Integrated C         	id=9	[slave  keyboard (3)]
    ↳ AT Translated Set 2 keyboard            	id=10	[slave  keyboard (3)]
    ↳ ThinkPad Extra Buttons                  	id=13	[slave  keyboard (3)]
    ↳ Logitech Wireless Keyboard PID:4023     	id=15	[slave  keyboard (3)]

```

2. Find your mouse id and see its props

`xinput --list-props 16`

sample output 

```
Device 'Logitech Wireless Mouse':
	Device Enabled (169):	1
	Coordinate Transformation Matrix (171):	1.000000, 0.000000, 0.000000, 0.000000, 1.000000, 0.000000, 0.000000, 0.000000, 1.000000
	libinput Natural Scrolling Enabled (312):	0
	libinput Natural Scrolling Enabled Default (313):	0
	libinput Scroll Methods Available (316):	0, 0, 1
	libinput Scroll Method Enabled (317):	0, 0, 0
	libinput Scroll Method Enabled Default (318):	0, 0, 0
	libinput Button Scrolling Button (330):	2
	libinput Button Scrolling Button Default (331):	2
	libinput Middle Emulation Enabled (322):	1
	libinput Middle Emulation Enabled Default (323):	0
	libinput Accel Speed (324):	-0.500000
	libinput Accel Speed Default (325):	0.000000
	libinput Accel Profiles Available (332):	1, 1
	libinput Accel Profile Enabled (333):	1, 0
	libinput Accel Profile Enabled Default (334):	1, 0
	libinput Left Handed Enabled (326):	0
	libinput Left Handed Enabled Default (327):	0
	libinput Send Events Modes Available (289):	1, 0
	libinput Send Events Mode Enabled (290):	0, 0
	libinput Send Events Mode Enabled Default (291):	0, 0
	Device Node (292):	"/dev/input/event17"
	Device Product ID (293):	1133, 16472
	libinput Drag Lock Buttons (328):	<no items>
	libinput Horizontal Scroll Enabled (329):	1

```

3. find something realated to `Speed` or `Accel` and get its id.
In my case it was `libinput Accel Speed (324):	-1.000000` with id `324`

4. In my case the sensitivity was low. I tweaked the value to `-0.5` to increase sensitivity

`xinput --set-prop 16 324 -0.5`