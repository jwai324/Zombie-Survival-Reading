/* The crew's looks for js/walker3d.js's people: June, Tomas and Pip on the walkers' rig, and a plain stand-in
   ("person") for a crew id with no look yet (Walker3D.humanId gives it). Data only. Colours are js/crewart.js's PEOPLE
   (the 2D portraits stay, so the two must agree: tests/validate-art.js compares them). A new crew member goes in an
   appended js/walker3d-crew2.js (loaded after this file, before js/interior.js) calling Walker3D.addHuman the same way;
   tests/validate-art.js holds every id in WORLD.CREW to having a look.

   def:
     scale  the height as a share of a grown-up (PERSON_H tiles): mirrors CREW[id].scale in js/story-crew.js, which
            wins when the facts are loaded (the test holds the two equal)
     r      a hit radius, tiles (people are never hit: the box's bar width only)
     build  model units for a figure about 1 tall (its standing top with the hair), the walkers' fields: ankle, shin,
            thigh, torso, neck; hipW, shW, footW; upper, fore, hand, foot; chest, waist ([across, front to back]);
            head, jaw ([x, y, z] radii); rThigh, rShin, rUpper, rFore, rNeck, rFoot, rise; finger (x a walker's);
            shadow. A child's head is bigger for the body and the limbs shorter.
     gait   stride (model units a cycle: Walker3D.stride gives tiles), duty, lift, crouch, lean, bob, sway, twist,
            roll, armSwing, headFwd, headTilt, toeOut, turnRate (rad/s, for the engine)
     look   colours ([r,g,b] or "#rrggbb"): skin, hair, hairShade, iris, brow, lip, blush, shirt (the outer top),
            under (what shows under it: the shirt in an open cardigan or collar), sleeveCol, cuff, pants, shoe, sole,
            glove (gloved hands; handSkin is the glove's colour), nail, grease, string, button, rim (glasses);
            top "cardigan" | "coveralls" | "hoodie" | "shirt"; hem (tiles below the hips, model units); sleeve
            "long" | "rolled"; hairStyle "short" | "bun" | "curly" (hairGrow, hairFront, hairBack, hairJag: the cap);
            glasses, ears, kid (a child's face), eyeSize, browW, smile, smudge (grease on a cheek);
            what they carry and do: hold "ledger" | "tool" | "pocket" | "none" standing and walking (holdSide: the hand,
            0 left 1 right), gesture (the hand that talks), job (the default work: "garden" | "hammer" |
            "clipboard"), lap (sitting: "ledger" | "wrench" | "walkie" | "none"), book (reading: "ledger" | "manual" |
            "notebook"), floorSit ("knees" | "cross"), cower ("hug" | "cover"); worn: rag (back pocket), walkie
            (clipped on), earPencil
     variants  looks the seed picks between (each overrides look) */
(function (root) {
  "use strict";
  const ZSR = (root.ZSR = root.ZSR || {});
  const W3 = ZSR.Walker3D;
  if (!W3 || !W3.addHuman) return;

  // in her sixties: grey hair in a bun, round glasses, a green cardigan open over a blue work shirt, brown trousers,
  // canvas gardening gloves, the green ledger under her left arm. Kneels at the beds to dig; reads the ledger open;
  // sits with it on her lap.
  W3.addHuman("june", {
    scale: 0.9,
    r: 0.25,
    build: {
      ankle: 0.042, shin: 0.225, thigh: 0.23, torso: 0.255, neck: 0.034,
      hipW: 0.056, shW: 0.108, footW: 0.054, upper: 0.158, fore: 0.14, hand: 0.056, foot: 0.088,
      chest: [0.106, 0.07], waist: [0.1, 0.068], head: [0.078, 0.09, 0.085], jaw: [0.056, 0.038, 0.056],
      rThigh: 0.047, rShin: 0.037, rUpper: 0.03, rFore: 0.026, rNeck: 0.028, rFoot: 0.027, rise: 0.032,
      finger: 0.85, shadow: 0.2,
    },
    gait: { stride: 0.78, duty: 0.61, lift: 0.035, crouch: 0.03, lean: 0.05, bob: 0.01, sway: 0.014, twist: 0.07, roll: 0.03, headFwd: 0.014, toeOut: 0.1, turnRate: 4.5 },
    look: {
      skin: "#efc4a2", blush: [226, 112, 92], lip: "#b5604f", iris: "#5b7f9a", brow: "#8f8a82",
      hair: "#cbc8c1", hairShade: "#9d9890", shirt: "#5b8a3c", sleeveCol: "#5b8a3c", cuff: "#4c7632", under: "#b3c7da",
      pants: "#6d5a42", shoe: "#5c3b24", sole: "#2c1f16", glove: "#b48f52", handSkin: "#dcc28a", nail: "#dcc28a",
      button: "#e9dcc0", rim: "#2a2420",
      top: "cardigan", hem: 0.085, sleeve: "long",
      hairStyle: "bun", hairGrow: 1.09, hairFront: 0.42, hairBack: -0.85, hairJag: 0.25,
      glasses: true, ears: true, browW: 0.055,
      hold: "ledger", holdSide: 0, gesture: 1, job: "garden", lap: "ledger", book: "ledger", floorSit: "knees", cower: "hug",
    },
  });

  // seventeen, tall and lanky: dark curly hair, navy coveralls (collar, chest pocket, grease smudges), sleeves rolled
  // to the elbow, a red rag in his back pocket, a wrench in his right hand. On one knee hammering a nail into a board;
  // reads a repair manual; sits with the wrench hanging from his hand.
  W3.addHuman("tomas", {
    scale: 1.0,
    r: 0.25,
    build: {
      ankle: 0.044, shin: 0.245, thigh: 0.255, torso: 0.25, neck: 0.042,
      hipW: 0.05, shW: 0.104, footW: 0.052, upper: 0.172, fore: 0.158, hand: 0.058, foot: 0.098,
      chest: [0.096, 0.06], waist: [0.078, 0.054], head: [0.068, 0.082, 0.077], jaw: [0.05, 0.036, 0.052],
      rThigh: 0.041, rShin: 0.033, rUpper: 0.027, rFore: 0.023, rNeck: 0.024, rFoot: 0.026, rise: 0.034,
      finger: 0.9, shadow: 0.19,
    },
    gait: { stride: 0.86, duty: 0.6, lift: 0.045, crouch: 0.025, lean: 0.06, bob: 0.013, sway: 0.01, twist: 0.09, roll: 0.025, headFwd: 0.02, toeOut: 0.08, turnRate: 5.5 },
    look: {
      skin: "#c88c60", blush: [190, 80, 60], lip: "#8f4a36", iris: "#4a2e1c", brow: "#22160f",
      hair: "#2b1d16", hairShade: "#4a3427", shirt: "#33507a", sleeveCol: "#33507a", under: "#d9d6cf",
      pants: "#33507a", shoe: "#3a2a20", sole: "#151210", nail: "#e2b49a", grease: [20, 22, 28],
      top: "coveralls", hem: 0.03, sleeve: "rolled",
      hairStyle: "curly", hairGrow: 1.1, hairFront: 0.5, hairBack: -0.7, hairJag: 0.2,
      ears: true, browW: 0.085, smile: 0.5, smudge: true,
      hold: "tool", holdSide: 1, gesture: 0, job: "hammer", lap: "wrench", book: "manual", floorSit: "knees", cower: "cover",
      rag: true,
    },
  });

  // eleven, small (a child: a big head for the body, short limbs): short dark hair, an orange hoodie with the hood
  // down and a front pocket (hands in it standing), jeans, white sneakers with red soles, a walkie-talkie clipped on,
  // a pencil behind the left ear. Writes on a clipboard; reads a notebook; sits cross-legged on the floor with the
  // walkie-talkie in both hands.
  W3.addHuman("pip", {
    scale: 0.74,
    r: 0.22,
    build: {
      ankle: 0.044, shin: 0.2, thigh: 0.2, torso: 0.225, neck: 0.028,
      hipW: 0.054, shW: 0.1, footW: 0.054, upper: 0.142, fore: 0.124, hand: 0.056, foot: 0.092,
      chest: [0.106, 0.074], waist: [0.104, 0.072], head: [0.1, 0.112, 0.104], jaw: [0.07, 0.044, 0.064],
      rThigh: 0.048, rShin: 0.041, rUpper: 0.035, rFore: 0.031, rNeck: 0.03, rFoot: 0.032, rise: 0.028,
      finger: 0.8, shadow: 0.19,
    },
    gait: { stride: 0.8, duty: 0.6, lift: 0.05, crouch: 0.03, lean: 0.05, bob: 0.016, sway: 0.014, twist: 0.1, roll: 0.03, headFwd: 0.01, toeOut: 0.08, turnRate: 6 },
    look: {
      skin: "#93603e", blush: [200, 90, 70], lip: "#6e3a28", iris: "#3a2416", brow: "#1d1512",
      hair: "#1f1713", hairShade: "#3d2c22", shirt: "#e8792a", sleeveCol: "#e8792a", cuff: "#c4601c", string: "#f3eee0",
      pants: "#3f5272", shoe: "#ece6d8", sole: "#c0362c", nail: "#c99a7a",
      top: "hoodie", hem: 0.06, sleeve: "long",
      hairStyle: "short", hairGrow: 1.1, hairFront: 0.48, hairBack: -0.65, hairJag: 0.55,
      ears: true, kid: true, eyeSize: 1.12, browW: 0.06,
      hold: "pocket", holdSide: 1, gesture: 1, job: "clipboard", lap: "walkie", book: "notebook", floorSit: "cross", cower: "hug",
      walkie: true, earPencil: true,
    },
  });

  // anyone the art does not know yet: a grown-up in grey work clothes, short brown hair (never invisible, never a
  // walker)
  W3.addHuman("person", {
    scale: 1.0,
    r: 0.25,
    build: {
      ankle: 0.044, shin: 0.23, thigh: 0.235, torso: 0.255, neck: 0.036,
      hipW: 0.054, shW: 0.106, footW: 0.054, upper: 0.16, fore: 0.144, hand: 0.056, foot: 0.094,
      chest: [0.1, 0.064], waist: [0.088, 0.06], head: [0.073, 0.086, 0.081], jaw: [0.054, 0.037, 0.055],
      rThigh: 0.045, rShin: 0.037, rUpper: 0.029, rFore: 0.025, rNeck: 0.026, rFoot: 0.028, rise: 0.034,
      finger: 0.85, shadow: 0.2,
    },
    gait: { stride: 0.82 },
    look: {
      skin: "#d2a07a", lip: "#9a5040", iris: "#4a3a2a", brow: "#3a2e26", hair: "#4a3a2e", hairShade: "#6a5444",
      shirt: "#7d858e", sleeveCol: "#7d858e", pants: "#4b5058", shoe: "#3a2e26", sole: "#1d1915",
      top: "shirt", hairStyle: "short", hairBack: -0.65, hold: "none", job: "hammer", lap: "none", book: "manual",
    },
  });
})(typeof window !== "undefined" ? window : globalThis);
