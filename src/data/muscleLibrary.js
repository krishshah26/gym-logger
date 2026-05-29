export const MUSCLE_REGIONS = [
  // ─── FRONT ───────────────────────────────────────────────────────────────
  {
    id: "chest",
    label: "Chest",
    view: "front",
    summary: "The pectorals drive horizontal pressing and shoulder adduction. Essential for bench work, dips, and fly variations.",
    subMuscles: [
      {
        id: "pectoralis-major",
        name: "Pectoralis Major",
        summary: "Large fan-shaped muscle responsible for pressing, adduction, and shoulder flexion.",
        image: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Pectoralis_major.png/320px-Pectoralis_major.png",
        exercises: [
          { name: "Bench Press", equipment: "Barbell", primary: "Chest", secondary: "Triceps, Shoulders", tips: ["Keep feet planted.", "Lower to mid-chest with elbows at ~45°.", "Drive through the floor on the press."] },
          { name: "Incline Dumbbell Press", equipment: "Dumbbell", primary: "Upper Chest", secondary: "Shoulders, Triceps", tips: ["Use a moderate 30–45° incline.", "Lower under control.", "Pause briefly at the bottom."] },
          { name: "Cable Fly", equipment: "Cable", primary: "Chest", secondary: "Shoulders", tips: ["Slight bend in the elbows throughout.", "Lead with the elbows, not the hands.", "Squeeze at the top."] },
        ],
      },
      {
        id: "pectoralis-minor",
        name: "Pectoralis Minor",
        summary: "Deep chest muscle that pulls the shoulder blade forward and down.",
        image: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7d/Serratus_anterior.png/320px-Serratus_anterior.png",
        exercises: [
          { name: "Dip", equipment: "Bodyweight", primary: "Lower Chest", secondary: "Triceps, Shoulders", tips: ["Lean forward slightly to target chest.", "Lower until elbows reach 90°.", "Avoid flaring elbows excessively."] },
          { name: "Decline Press", equipment: "Barbell", primary: "Lower Chest", secondary: "Triceps", tips: ["Use a slight decline.", "Control the descent.", "Keep wrists stacked over elbows."] },
        ],
      },
      {
        id: "serratus-anterior",
        name: "Serratus Anterior",
        summary: "Stabilizes the shoulder blade and supports upward arm movement.",
        image: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7d/Serratus_anterior.png/320px-Serratus_anterior.png",
        exercises: [
          { name: "Push-Up Plus", equipment: "Bodyweight", primary: "Serratus Anterior", secondary: "Chest, Triceps", tips: ["At the top of a push-up, push the shoulder blades away.", "Move through full shoulder range.", "Keep the core tight throughout."] },
          { name: "Landmine Press", equipment: "Barbell", primary: "Serratus, Upper Chest", secondary: "Shoulders", tips: ["Press the bar upward and forward.", "Rotate the torso slightly at the top.", "Control the descent."] },
        ],
      },
    ],
  },

  {
    id: "shoulders",
    label: "Shoulders",
    view: "front",
    summary: "The deltoids and surrounding stabilizers drive overhead pressing, lateral raises, and shoulder health.",
    subMuscles: [
      {
        id: "anterior-deltoid",
        name: "Anterior Deltoid",
        summary: "Front head of the shoulder; drives pushing and forward arm raises.",
        image: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8b/Deltoid_muscle.png/320px-Deltoid_muscle.png",
        exercises: [
          { name: "Overhead Press", equipment: "Barbell", primary: "Shoulders", secondary: "Triceps, Upper Chest", tips: ["Brace the core hard.", "Keep the ribcage down.", "Press overhead without arching the lower back."] },
          { name: "Front Raise", equipment: "Dumbbell", primary: "Anterior Delt", secondary: "Traps", tips: ["Keep elbows slightly soft.", "Raise to shoulder height.", "Control the lowering phase."] },
        ],
      },
      {
        id: "lateral-deltoid",
        name: "Lateral Deltoid",
        summary: "Side head that creates shoulder width; key for lateral raises and upright rows.",
        image: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8b/Deltoid_muscle.png/320px-Deltoid_muscle.png",
        exercises: [
          { name: "Lateral Raise", equipment: "Dumbbell", primary: "Lateral Delt", secondary: "Traps", tips: ["Lead with the elbows, not the hands.", "Raise to shoulder height.", "Use a very slight forward lean."] },
          { name: "Cable Lateral Raise", equipment: "Cable", primary: "Lateral Delt", secondary: "Traps", tips: ["Set the cable at hip height.", "Keep constant tension through the movement.", "Pause briefly at the top."] },
        ],
      },
      {
        id: "posterior-deltoid-front",
        name: "Posterior Deltoid",
        summary: "Rear head of the shoulder; supports horizontal pulling and external rotation.",
        image: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8b/Deltoid_muscle.png/320px-Deltoid_muscle.png",
        exercises: [
          { name: "Arnold Press", equipment: "Dumbbell", primary: "All Delt Heads", secondary: "Triceps, Upper Chest", tips: ["Start with palms facing you.", "Rotate outward as you press up.", "Full range of motion."] },
          { name: "Band Pull-Apart", equipment: "Band", primary: "Rear Delt", secondary: "Traps, Rhomboids", tips: ["Keep arms straight.", "Pull until the band touches your chest.", "Control the return."] },
        ],
      },
    ],
  },

  {
    id: "biceps",
    label: "Biceps",
    view: "front",
    summary: "The biceps flex the elbow and supinate the forearm. Key for all pulling and curling movements.",
    subMuscles: [
      {
        id: "biceps-long-head",
        name: "Long Head",
        summary: "Outer portion of the biceps; forms the peak when contracted.",
        image: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Biceps_brachii.png/320px-Biceps_brachii.png",
        exercises: [
          { name: "Incline Dumbbell Curl", equipment: "Dumbbell", primary: "Biceps Long Head", secondary: "Brachialis", tips: ["Set bench to 45–60°.", "Let arms hang fully.", "Curl with a slow, controlled tempo."] },
          { name: "Hammer Curl", equipment: "Dumbbell", primary: "Biceps, Brachialis", secondary: "Forearms", tips: ["Keep elbows pinned to sides.", "Neutral grip throughout.", "Avoid swinging."] },
        ],
      },
      {
        id: "biceps-short-head",
        name: "Short Head",
        summary: "Inner biceps; adds width when viewed from the front.",
        image: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Biceps_brachii.png/320px-Biceps_brachii.png",
        exercises: [
          { name: "Concentration Curl", equipment: "Dumbbell", primary: "Biceps Short Head", secondary: "Brachialis", tips: ["Brace elbow against inner thigh.", "Full supination at the top.", "Slow negative."] },
          { name: "Preacher Curl", equipment: "Barbell", primary: "Biceps Short Head", secondary: "Brachialis", tips: ["Full stretch at the bottom.", "Don't let the bar bounce.", "Control the descent."] },
        ],
      },
      {
        id: "brachialis",
        name: "Brachialis",
        summary: "Lies beneath the biceps; primary elbow flexor regardless of grip.",
        image: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Biceps_brachii.png/320px-Biceps_brachii.png",
        exercises: [
          { name: "Reverse Curl", equipment: "Barbell", primary: "Brachialis, Forearms", secondary: "Biceps", tips: ["Overhand grip.", "Keep elbows fixed.", "Pause at the top."] },
          { name: "Cross-Body Hammer Curl", equipment: "Dumbbell", primary: "Brachialis", secondary: "Biceps", tips: ["Curl across the body toward the opposite shoulder.", "Control the lowering.", "Alternate arms."] },
        ],
      },
    ],
  },

  {
    id: "forearms",
    label: "Forearms",
    view: "front",
    summary: "Forearm muscles control grip, wrist flexion and extension, and contribute to pulling strength.",
    subMuscles: [
      {
        id: "wrist-flexors",
        name: "Wrist Flexors",
        summary: "Inner forearm muscles responsible for grip and wrist flexion.",
        image: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f2/Brachioradialis.png/320px-Brachioradialis.png",
        exercises: [
          { name: "Wrist Curl", equipment: "Barbell", primary: "Wrist Flexors", secondary: "Forearms", tips: ["Rest forearms on bench.", "Full range of motion.", "Use a controlled tempo."] },
          { name: "Farmer's Carry", equipment: "Dumbbell", primary: "Grip, Forearms", secondary: "Traps, Core", tips: ["Walk tall with shoulders back.", "Grip firmly throughout.", "Keep steps controlled."] },
        ],
      },
      {
        id: "wrist-extensors",
        name: "Wrist Extensors",
        summary: "Outer forearm muscles for wrist extension and grip stability.",
        image: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f2/Brachioradialis.png/320px-Brachioradialis.png",
        exercises: [
          { name: "Reverse Wrist Curl", equipment: "Barbell", primary: "Wrist Extensors", secondary: "Forearms", tips: ["Overhand grip.", "Rest forearms on bench.", "Control each rep."] },
        ],
      },
      {
        id: "brachioradialis",
        name: "Brachioradialis",
        summary: "Bridges the upper arm and forearm; assists elbow flexion with neutral grip.",
        image: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f2/Brachioradialis.png/320px-Brachioradialis.png",
        exercises: [
          { name: "Hammer Curl", equipment: "Dumbbell", primary: "Brachioradialis, Brachialis", secondary: "Biceps", tips: ["Neutral grip throughout.", "Keep upper arms fixed.", "Pause at full contraction."] },
          { name: "Reverse Curl", equipment: "Barbell", primary: "Brachioradialis", secondary: "Wrist Extensors", tips: ["Overhand grip.", "Controlled tempo.", "Full elbow extension at the bottom."] },
        ],
      },
    ],
  },

  {
    id: "abs",
    label: "Abs",
    view: "front",
    summary: "The abdominals stabilize the trunk, support spinal flexion, and transfer force during compound lifts.",
    subMuscles: [
      {
        id: "rectus-abdominis",
        name: "Rectus Abdominis",
        summary: "The '6-pack' muscle; drives spinal flexion and trunk stabilization.",
        image: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Rectus_abdominis.png/320px-Rectus_abdominis.png",
        exercises: [
          { name: "Cable Crunch", equipment: "Cable", primary: "Rectus Abdominis", secondary: "Obliques", tips: ["Pull with the abs, not the arms.", "Round the spine fully at the bottom.", "Control the return."] },
          { name: "Hanging Leg Raise", equipment: "Bodyweight", primary: "Lower Abs, Hip Flexors", secondary: "Core", tips: ["Avoid swinging.", "Tuck pelvis at the top.", "Lower legs under control."] },
        ],
      },
      {
        id: "transverse-abdominis",
        name: "Transverse Abdominis",
        summary: "Deep core stabilizer; essential for spinal stiffness and force transfer.",
        image: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Rectus_abdominis.png/320px-Rectus_abdominis.png",
        exercises: [
          { name: "Dead Bug", equipment: "Bodyweight", primary: "Deep Core", secondary: "Hip Flexors", tips: ["Move slowly.", "Keep the lower back gently pressed down.", "Breathe out as you extend."] },
          { name: "Plank", equipment: "Bodyweight", primary: "Core", secondary: "Shoulders, Glutes", tips: ["Create a straight line from head to heels.", "Squeeze glutes and brace hard.", "Breathe normally throughout."] },
          { name: "Pallof Press", equipment: "Cable", primary: "Anti-Rotation Core", secondary: "Obliques, Shoulders", tips: ["Stand perpendicular to the cable.", "Press and hold for 1–2 seconds.", "Resist any rotation."] },
        ],
      },
    ],
  },

  {
    id: "obliques",
    label: "Obliques",
    view: "front",
    summary: "Obliques drive rotation, lateral flexion, and provide anti-rotation stability through the core.",
    subMuscles: [
      {
        id: "external-oblique",
        name: "External Oblique",
        summary: "Outer layer; drives rotation and side bending, key for athletic power.",
        image: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Rectus_abdominis.png/320px-Rectus_abdominis.png",
        exercises: [
          { name: "Russian Twist", equipment: "Bodyweight", primary: "Obliques", secondary: "Abs", tips: ["Lean back slightly.", "Rotate from the torso, not the arms.", "Keep feet elevated for more challenge."] },
          { name: "Cable Wood Chop", equipment: "Cable", primary: "Obliques", secondary: "Shoulders, Core", tips: ["Set cable high.", "Rotate with hips and core.", "Arms stay extended."] },
        ],
      },
      {
        id: "internal-oblique",
        name: "Internal Oblique",
        summary: "Deep to the external oblique; assists rotation and core compression.",
        image: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Rectus_abdominis.png/320px-Rectus_abdominis.png",
        exercises: [
          { name: "Side Plank", equipment: "Bodyweight", primary: "Obliques, Core", secondary: "Hip Abductors", tips: ["Stack feet or stagger them.", "Push the hip up toward the ceiling.", "Maintain a straight line."] },
          { name: "Bicycle Crunch", equipment: "Bodyweight", primary: "Obliques, Abs", secondary: "Hip Flexors", tips: ["Rotate shoulder toward opposite knee.", "Keep slow, deliberate reps.", "Avoid pulling the neck."] },
        ],
      },
    ],
  },

  {
    id: "quads",
    label: "Quads",
    view: "front",
    summary: "Quadriceps extend the knee and flex the hip. Dominant in squatting, running, and jumping.",
    subMuscles: [
      {
        id: "rectus-femoris",
        name: "Rectus Femoris",
        summary: "Only quad that crosses the hip; drives knee extension and hip flexion.",
        image: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Quadriceps_femoris.png/320px-Quadriceps_femoris.png",
        exercises: [
          { name: "Squat", equipment: "Barbell", primary: "Quads", secondary: "Glutes, Core", tips: ["Keep knees tracking over toes.", "Brace the core hard.", "Drive through the mid-foot."] },
          { name: "Leg Extension", equipment: "Machine", primary: "Quads", secondary: "None", tips: ["Control the lowering phase.", "Pause at full extension.", "Use a full range of motion."] },
        ],
      },
      {
        id: "vastus-lateralis",
        name: "Vastus Lateralis",
        summary: "Outer quad; contributes to knee stability and the quad sweep.",
        image: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Quadriceps_femoris.png/320px-Quadriceps_femoris.png",
        exercises: [
          { name: "Leg Press", equipment: "Machine", primary: "Quads, Glutes", secondary: "Hamstrings", tips: ["Set feet shoulder-width.", "Don't lock knees at the top.", "Control the descent."] },
          { name: "Hack Squat", equipment: "Machine", primary: "Quads", secondary: "Glutes", tips: ["Keep heels grounded.", "Full range of motion.", "Drive through both feet evenly."] },
        ],
      },
      {
        id: "vastus-medialis",
        name: "Vastus Medialis",
        summary: "Inner quad teardrop; important for knee tracking and finishing the lock-out.",
        image: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Quadriceps_femoris.png/320px-Quadriceps_femoris.png",
        exercises: [
          { name: "Bulgarian Split Squat", equipment: "Dumbbell", primary: "Quads, Glutes", secondary: "Hamstrings, Core", tips: ["Keep front shin vertical.", "Lower the back knee toward the floor.", "Drive up through the front heel."] },
          { name: "Close-Stance Squat", equipment: "Barbell", primary: "Quads", secondary: "Glutes", tips: ["Narrow stance shifts load to VMO.", "Control depth carefully.", "Knees out over toes."] },
        ],
      },
      {
        id: "vastus-intermedius",
        name: "Vastus Intermedius",
        summary: "Deep central quad; works alongside the other heads in all knee extension.",
        image: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Quadriceps_femoris.png/320px-Quadriceps_femoris.png",
        exercises: [
          { name: "Sissy Squat", equipment: "Bodyweight", primary: "Quads", secondary: "None", tips: ["Lean back as you lower.", "Only go as deep as comfortable.", "Use a support if needed."] },
        ],
      },
    ],
  },

  {
    id: "calves",
    label: "Calves",
    summary: "Calf muscles plantarflex the ankle and absorb force during walking, running, and jumping.",
    subMuscles: [
      {
        id: "gastrocnemius",
        name: "Gastrocnemius",
        summary: "The large visible calf muscle; crosses both the knee and ankle joints.",
        image: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Gastrocnemius.png/320px-Gastrocnemius.png",
        exercises: [
          { name: "Standing Calf Raise", equipment: "Machine", primary: "Gastrocnemius", secondary: "Soleus", tips: ["Full range — heel drop to toe raise.", "Pause at the top.", "Slow eccentric for growth."] },
          { name: "Jump Rope", equipment: "Bodyweight", primary: "Calves, Coordination", secondary: "Cardio", tips: ["Stay on the balls of the feet.", "Keep jumps small and efficient.", "Build duration gradually."] },
        ],
      },
      {
        id: "soleus",
        name: "Soleus",
        summary: "Deep calf muscle; primary plantarflexor when the knee is bent.",
        image: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Gastrocnemius.png/320px-Gastrocnemius.png",
        exercises: [
          { name: "Seated Calf Raise", equipment: "Machine", primary: "Soleus", secondary: "Gastrocnemius", tips: ["Bent knee isolates the soleus.", "Full stretch at the bottom.", "Slow, deliberate reps."] },
          { name: "Donkey Calf Raise", equipment: "Machine", primary: "Gastrocnemius, Soleus", secondary: "None", tips: ["Hinge at the hips.", "Full stretch at the bottom.", "Drive up onto toes fully."] },
        ],
      },
    ],
  },

  // ─── BACK ────────────────────────────────────────────────────────────────
  {
    id: "traps",
    label: "Traps",
    view: "back",
    summary: "The trapezius controls the shoulder blade, supports heavy loads, and drives neck and upper back posture.",
    subMuscles: [
      {
        id: "upper-traps",
        name: "Upper Traps",
        summary: "Elevates the shoulder blade; key in shrugs, cleans, and overhead stability.",
        image: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Trapezius.png/320px-Trapezius.png",
        exercises: [
          { name: "Barbell Shrug", equipment: "Barbell", primary: "Upper Traps", secondary: "Forearms", tips: ["Elevate straight up — no rolling.", "Pause at the top for 1–2s.", "Use straps to avoid grip fatigue."] },
          { name: "Face Pull", equipment: "Cable", primary: "Upper Traps, Rear Delts", secondary: "Rotator Cuff", tips: ["Set the cable at face height.", "Pull to the forehead with elbows high.", "Squeeze shoulder blades."] },
        ],
      },
      {
        id: "mid-traps",
        name: "Mid Traps",
        summary: "Retracts the scapula; important for posture and horizontal pulling.",
        image: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Trapezius.png/320px-Trapezius.png",
        exercises: [
          { name: "Seated Row", equipment: "Cable", primary: "Mid Traps, Rhomboids", secondary: "Lats, Rear Delts", tips: ["Pull elbows back with a slight squeeze.", "Keep chest tall.", "Avoid shrugging."] },
          { name: "Prone Y Raise", equipment: "Bodyweight", primary: "Lower and Mid Traps", secondary: "Rear Delts", tips: ["Lie face down.", "Raise arms in a Y shape.", "Squeeze the shoulder blades together."] },
        ],
      },
      {
        id: "lower-traps",
        name: "Lower Traps",
        summary: "Depresses and stabilizes the scapula; prevents shoulder elevation under load.",
        image: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Trapezius.png/320px-Trapezius.png",
        exercises: [
          { name: "Pull-Up", equipment: "Bodyweight", primary: "Lats, Lower Traps", secondary: "Biceps, Core", tips: ["Start from a dead hang.", "Depress shoulders before pulling.", "Pull chest toward the bar."] },
          { name: "Cable Y Raise", equipment: "Cable", primary: "Lower Traps", secondary: "Rear Delts", tips: ["Set cables low.", "Raise arms in a Y overhead.", "Focus on scapular depression."] },
        ],
      },
    ],
  },

  {
    id: "rearDelts",
    label: "Rear Delts",
    view: "back",
    summary: "Posterior deltoids and rotator cuff muscles stabilize the shoulder and drive horizontal pulling.",
    subMuscles: [
      {
        id: "posterior-deltoid",
        name: "Posterior Deltoid",
        summary: "Rear shoulder head; drives horizontal abduction and shoulder health.",
        image: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8b/Deltoid_muscle.png/320px-Deltoid_muscle.png",
        exercises: [
          { name: "Reverse Fly", equipment: "Dumbbell", primary: "Rear Delts", secondary: "Mid Traps, Rhomboids", tips: ["Hinge forward at the hips.", "Raise with elbows slightly bent.", "Squeeze at the top."] },
          { name: "Face Pull", equipment: "Cable", primary: "Rear Delts, Traps", secondary: "Rotator Cuff", tips: ["Set the cable at face height.", "Pull to the forehead with elbows high.", "Pause and squeeze."] },
        ],
      },
      {
        id: "infraspinatus",
        name: "Infraspinatus",
        summary: "Rotator cuff muscle; prevents shoulder impingement and supports external rotation.",
        image: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8b/Deltoid_muscle.png/320px-Deltoid_muscle.png",
        exercises: [
          { name: "Cable External Rotation", equipment: "Cable", primary: "Infraspinatus, Rotator Cuff", secondary: "Rear Delt", tips: ["Keep elbow fixed at 90°.", "Rotate outward only.", "Slow and deliberate."] },
          { name: "Band Pull-Apart", equipment: "Band", primary: "Rear Delts, Rotator Cuff", secondary: "Traps", tips: ["Arms straight, shoulder-width apart.", "Pull band to chest level.", "Controlled return."] },
        ],
      },
    ],
  },

  {
    id: "lats",
    label: "Lats",
    view: "back",
    summary: "The latissimus dorsi creates the V-taper and drives shoulder extension, adduction, and all pulling movements.",
    subMuscles: [
      {
        id: "latissimus-dorsi",
        name: "Latissimus Dorsi",
        summary: "Largest back muscle; key for pull-ups, rows, and any overhead pulling.",
        image: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Latissimus_dorsi.png/320px-Latissimus_dorsi.png",
        exercises: [
          { name: "Pull-Up", equipment: "Bodyweight", primary: "Lats", secondary: "Biceps, Rear Delts", tips: ["Start from a dead hang.", "Pull elbows toward your hips.", "Full range of motion."] },
          { name: "Lat Pulldown", equipment: "Machine", primary: "Lats", secondary: "Biceps, Rear Delts", tips: ["Neutral spine.", "Pull elbows toward your ribs.", "Control the return phase."] },
          { name: "Single-Arm Row", equipment: "Dumbbell", primary: "Lats, Upper Back", secondary: "Biceps, Rear Delts", tips: ["Brace on the bench.", "Pull elbow toward the hip.", "Full stretch at the bottom."] },
        ],
      },
      {
        id: "teres-major",
        name: "Teres Major",
        summary: "Assists the lat in shoulder extension and internal rotation.",
        image: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Latissimus_dorsi.png/320px-Latissimus_dorsi.png",
        exercises: [
          { name: "Straight-Arm Pulldown", equipment: "Cable", primary: "Lats, Teres Major", secondary: "Core", tips: ["Keep arms straight throughout.", "Pull from shoulder height to hips.", "Squeeze lats at the bottom."] },
          { name: "Pull-Up", equipment: "Bodyweight", primary: "Lats, Teres Major", secondary: "Biceps", tips: ["Wide grip emphasizes the outer back.", "Full hang at the start.", "Drive elbows down and back."] },
        ],
      },
    ],
  },

  {
    id: "triceps",
    label: "Triceps",
    view: "back",
    summary: "The triceps extend the elbow and contribute to all pushing movements. They make up two-thirds of upper arm mass.",
    subMuscles: [
      {
        id: "triceps-long-head",
        name: "Long Head",
        summary: "Largest triceps head; crosses the shoulder joint and responds well to overhead loading.",
        image: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/83/Triceps_brachii.png/320px-Triceps_brachii.png",
        exercises: [
          { name: "Overhead Triceps Extension", equipment: "Dumbbell", primary: "Triceps Long Head", secondary: "Triceps", tips: ["Keep elbows pointing forward.", "Full stretch at the bottom.", "Extend fully at the top."] },
          { name: "Skull Crusher", equipment: "Barbell", primary: "Triceps", secondary: "None", tips: ["Lower bar toward the forehead.", "Keep elbows fixed.", "Full range of motion."] },
        ],
      },
      {
        id: "triceps-lateral-head",
        name: "Lateral Head",
        summary: "Creates the horseshoe shape; highly active in pressing and pushdowns.",
        image: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/83/Triceps_brachii.png/320px-Triceps_brachii.png",
        exercises: [
          { name: "Triceps Pushdown", equipment: "Cable", primary: "Triceps Lateral Head", secondary: "Triceps", tips: ["Keep elbows pinned to sides.", "Full extension at the bottom.", "Don't let elbows flare."] },
          { name: "Close-Grip Bench Press", equipment: "Barbell", primary: "Triceps", secondary: "Chest, Shoulders", tips: ["Shoulder-width grip.", "Elbows at 45° from torso.", "Full lock-out at the top."] },
        ],
      },
      {
        id: "triceps-medial-head",
        name: "Medial Head",
        summary: "Deep head; active through all elbow extension, especially at lock-out.",
        image: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/83/Triceps_brachii.png/320px-Triceps_brachii.png",
        exercises: [
          { name: "Rope Pushdown", equipment: "Cable", primary: "Triceps", secondary: "None", tips: ["Split the rope at the bottom.", "Full extension on each rep.", "Keep elbows fixed."] },
          { name: "Dip", equipment: "Bodyweight", primary: "Triceps, Chest", secondary: "Shoulders", tips: ["Stay upright to target triceps more.", "Full elbow extension at the top.", "Lower to 90°."] },
        ],
      },
    ],
  },

  {
    id: "lowerBack",
    label: "Lower Back",
    view: "back",
    summary: "Erector spinae and deep stabilizers extend the spine and maintain posture under heavy load.",
    subMuscles: [
      {
        id: "erector-spinae",
        name: "Erector Spinae",
        summary: "Runs the length of the spine; critical for deadlifts, squats, and everyday posture.",
        image: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8b/Erector_spinae.png/320px-Erector_spinae.png",
        exercises: [
          { name: "Deadlift", equipment: "Barbell", primary: "Erector Spinae, Glutes", secondary: "Hamstrings, Traps", tips: ["Maintain a neutral spine throughout.", "Drive the floor away, don't yank.", "Keep the bar close to the body."] },
          { name: "Back Extension", equipment: "Bodyweight", primary: "Erector Spinae, Glutes", secondary: "Hamstrings", tips: ["Hinge at the hips.", "Don't hyper-extend at the top.", "Add weight for progression."] },
          { name: "Good Morning", equipment: "Barbell", primary: "Erector Spinae, Hamstrings", secondary: "Glutes", tips: ["Keep knees soft.", "Hinge until torso is near-parallel.", "Brace the core the entire time."] },
        ],
      },
      {
        id: "multifidus",
        name: "Multifidus",
        summary: "Deep segmental stabilizer; essential for protecting the spine under load.",
        image: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8b/Erector_spinae.png/320px-Erector_spinae.png",
        exercises: [
          { name: "Bird Dog", equipment: "Bodyweight", primary: "Multifidus, Core", secondary: "Glutes", tips: ["Maintain a neutral spine.", "Extend opposite arm and leg.", "Move slowly without any rotation."] },
          { name: "Plank", equipment: "Bodyweight", primary: "Deep Core, Multifidus", secondary: "Glutes, Shoulders", tips: ["Neutral spine — no sagging.", "Brace the core as if about to take a punch.", "Breathe normally."] },
        ],
      },
    ],
  },

  {
    id: "glutes",
    label: "Glutes",
    view: "back",
    summary: "The glutes are the body's largest muscle group, driving hip extension, abduction, and explosive power.",
    subMuscles: [
      {
        id: "gluteus-maximus",
        name: "Gluteus Maximus",
        summary: "Largest glute muscle; primary hip extensor in squats, deadlifts, and hip thrusts.",
        image: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/59/Gluteus_maximus.png/320px-Gluteus_maximus.png",
        exercises: [
          { name: "Hip Thrust", equipment: "Barbell", primary: "Glutes", secondary: "Hamstrings, Core", tips: ["Shoulders on bench at upper traps.", "Drive through the heels.", "Squeeze hard at the top — full hip extension."] },
          { name: "Romanian Deadlift", equipment: "Barbell", primary: "Glutes, Hamstrings", secondary: "Erector Spinae", tips: ["Hinge, don't squat.", "Feel the hamstring stretch.", "Keep bar close to the legs."] },
          { name: "Squat", equipment: "Barbell", primary: "Glutes, Quads", secondary: "Core, Hamstrings", tips: ["Drive knees out.", "Sit into the heels.", "Full depth where mobility allows."] },
        ],
      },
      {
        id: "gluteus-medius",
        name: "Gluteus Medius",
        summary: "Side glute; stabilizes the pelvis during single-leg movements.",
        image: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/59/Gluteus_maximus.png/320px-Gluteus_maximus.png",
        exercises: [
          { name: "Side-Lying Abduction", equipment: "Bodyweight", primary: "Glute Med", secondary: "Hip Abductors", tips: ["Keep hips stacked.", "Raise the top leg to 45°.", "Slow and controlled."] },
          { name: "Clamshell", equipment: "Band", primary: "Glute Med", secondary: "External Hip Rotators", tips: ["Band just above the knees.", "Keep feet together.", "Rotate the top knee upward."] },
          { name: "Monster Walk", equipment: "Band", primary: "Glute Med, Glute Min", secondary: "Hip Abductors", tips: ["Band around ankles.", "Maintain a slight squat.", "Step laterally with control."] },
        ],
      },
      {
        id: "gluteus-minimus",
        name: "Gluteus Minimus",
        summary: "Deepest glute; assists with hip abduction and internal rotation.",
        image: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/59/Gluteus_maximus.png/320px-Gluteus_maximus.png",
        exercises: [
          { name: "Hip Abduction Machine", equipment: "Machine", primary: "Glute Med, Glute Min", secondary: "Hip Abductors", tips: ["Sit upright.", "Push outward with control.", "Slow return."] },
        ],
      },
    ],
  },

  {
    id: "hamstrings",
    label: "Hamstrings",
    view: "back",
    summary: "Hamstrings flex the knee and extend the hip, working in concert with the glutes in every pulling and hinge movement.",
    subMuscles: [
      {
        id: "biceps-femoris",
        name: "Biceps Femoris",
        summary: "Outer hamstring; dominant in hip extension and knee flexion.",
        image: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/01/Biceps_femoris.png/320px-Biceps_femoris.png",
        exercises: [
          { name: "Romanian Deadlift", equipment: "Barbell", primary: "Hamstrings, Glutes", secondary: "Erector Spinae", tips: ["Hinge at the hips.", "Maintain a neutral spine.", "Feel the stretch in the hamstrings."] },
          { name: "Lying Leg Curl", equipment: "Machine", primary: "Hamstrings", secondary: "Calves", tips: ["Curl through full range.", "Don't let hips rise.", "Slow eccentric."] },
        ],
      },
      {
        id: "semitendinosus",
        name: "Semitendinosus",
        summary: "Inner hamstring; works alongside the biceps femoris in all knee flexion.",
        image: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/01/Biceps_femoris.png/320px-Biceps_femoris.png",
        exercises: [
          { name: "Nordic Curl", equipment: "Bodyweight", primary: "Hamstrings", secondary: "Glutes, Calves", tips: ["Lower as slowly as possible.", "Catch yourself at the bottom.", "Eccentric overload is the goal."] },
          { name: "Sumo Romanian Deadlift", equipment: "Dumbbell", primary: "Inner Hamstrings, Glutes", secondary: "Adductors", tips: ["Wider stance than conventional.", "Toes angled out.", "Hinge with a neutral spine."] },
        ],
      },
      {
        id: "semimembranosus",
        name: "Semimembranosus",
        summary: "Deep inner hamstring; contributes to knee flexion and internal tibial rotation.",
        image: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/01/Biceps_femoris.png/320px-Biceps_femoris.png",
        exercises: [
          { name: "Glute-Ham Raise", equipment: "Machine", primary: "Hamstrings", secondary: "Glutes, Calves", tips: ["Control the descent carefully.", "Drive hips into the pad.", "Full extension to full flexion."] },
          { name: "Leg Curl", equipment: "Machine", primary: "Hamstrings", secondary: "Calves", tips: ["Adjust pad above the ankle.", "Full range of motion.", "Pause at full contraction."] },
        ],
      },
    ],
  },
];

export function getMuscleRegionById(regionId) {
  return MUSCLE_REGIONS.find((region) => region.id === regionId) || MUSCLE_REGIONS[0];
}