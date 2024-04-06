let str = "Fists: 67\nShotgun: 221\nSMG: 64\nM79: 1,234\nBarrett: 55,449\nShock Rifle: 159\nPulse Gun: 237\nFlamer: 52\nRPG: 51,666\nRifle: 178\nLasergun: 196\nAK-47: 6,036\nHand Grenade: 17,132\nCluster Grenade: 1,326\nShuriken: 10,275\nDeagles: 43\nSnowballs: 1,913\nMinigun: 359\nX75: 98\nMAC-10: 136\nBow: 77\nAvenger: 210\nCarbine: 99\nChainsaw: 755\nLink Gun: 120";

// Use .split() to split the string into individual lines
let lines = str.split("\n");

// finds the longest line
let longest = 0;
for (let i = 0; i < lines.length; i++) {
   if (lines[i].length > longest) {
      longest = lines[i].length;
   }
}

// Use .padEnd() to add whitespace to the end of each line
lines = lines.map(line => line.padEnd(longest+2, " "));

str = "";
for (var i = 0; i < lines.length; i++) {
  if (i > 0) {
    if (i % 2 == 0) {
      str += "\n";
    } else {
      str += " ";
    }
  }
  str += lines[i];
}

console.log(str);
