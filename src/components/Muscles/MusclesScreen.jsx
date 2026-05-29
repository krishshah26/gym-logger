import React, { useMemo, useState } from "react";
import { MUSCLE_REGIONS } from "../../data/muscleLibrary";
import { BodySilhouette } from "./BodySilhouette";

export function MusclesScreen() {
  const [view, setView] = useState("front");
  const [selectedRegionId, setSelectedRegionId] = useState("chest");
  const [selectedMuscleId, setSelectedMuscleId] = useState("pectoralis-major");
  const [selectedExerciseName, setSelectedExerciseName] = useState("Bench Press");

  const selectedRegion = useMemo(
    () => MUSCLE_REGIONS.find((region) => region.id === selectedRegionId) || MUSCLE_REGIONS[0],
    [selectedRegionId]
  );

  const selectedMuscle = useMemo(
    () => selectedRegion.subMuscles.find((muscle) => muscle.id === selectedMuscleId) || selectedRegion.subMuscles[0],
    [selectedMuscleId, selectedRegion]
  );

  const selectedExercise = useMemo(
    () => selectedMuscle.exercises.find((exercise) => exercise.name === selectedExerciseName) || selectedMuscle.exercises[0],
    [selectedExerciseName, selectedMuscle]
  );

  const handleSelectRegion = (regionId) => {
    setSelectedRegionId(regionId);
    const region = MUSCLE_REGIONS.find((item) => item.id === regionId) || MUSCLE_REGIONS[0];
    setSelectedMuscleId(region.subMuscles[0]?.id || "");
    setSelectedExerciseName(region.subMuscles[0]?.exercises[0]?.name || "");
    // Auto-switch front/back view based on the region's native side
    if (region.view) setView(region.view);
  };

  return (
    <div className="screen muscles-screen">
      <div className="screen-header">
        <div>
          <p className="screen-eyebrow">Phase 3</p>
          <h1 className="screen-title">Muscles</h1>
        </div>
      </div>

      <div className="muscle-toggle-row">
        <button
          className={`mini-action-btn ${view === "front" ? "active" : ""}`}
          onClick={() => setView("front")}
        >
          Front
        </button>
        <button
          className={`mini-action-btn ${view === "back" ? "active" : ""}`}
          onClick={() => setView("back")}
        >
          Back
        </button>
      </div>

      <BodySilhouette
        view={view}
        selectedRegionId={selectedRegionId}
        onSelectRegion={handleSelectRegion}
      />

      <div className="section">
        <div className="section-header-row">
          <h2 className="section-title">Explore {selectedRegion.label}</h2>
          <span className="muscle-count-badge">
            {selectedRegion.subMuscles.length} {selectedRegion.subMuscles.length === 1 ? "muscle" : "muscles"}
          </span>
        </div>
        <p className="muted small">{selectedRegion.summary}</p>
        <div className="chip-row" style={{ marginTop: "10px" }}>
          {selectedRegion.subMuscles.map((muscle) => (
            <button
              key={muscle.id}
              className={`chip-btn ${selectedMuscle.id === muscle.id ? "active" : ""}`}
              onClick={() => {
                setSelectedMuscleId(muscle.id);
                setSelectedExerciseName(muscle.exercises[0]?.name || "");
              }}
            >
              {muscle.name}
            </button>
          ))}
        </div>
      </div>

      <div className="section muscle-detail-card">
        <div className="muscle-detail-top">
          <div>
            <p className="screen-eyebrow">Selected muscle</p>
            <h2 className="section-title" style={{ marginBottom: "6px" }}>{selectedMuscle.name}</h2>
            <p className="muted small">{selectedMuscle.summary}</p>
          </div>
          <img
            className="muscle-image"
            src={selectedMuscle.image}
            alt={selectedMuscle.name}
            onError={(event) => { event.currentTarget.style.display = "none"; }}
          />
        </div>

        <div className="exercise-list-header">
          <span className="muted small" style={{ fontWeight: 600 }}>Exercises</span>
          <span className="muted small">{selectedMuscle.exercises.length} total</span>
        </div>

        <div className="exercise-list">
          {selectedMuscle.exercises.map((exercise) => (
            <button
              key={exercise.name}
              className={`exercise-card ${selectedExercise.name === exercise.name ? "active" : ""}`}
              onClick={() => setSelectedExerciseName(exercise.name)}
              type="button"
            >
              <strong>{exercise.name}</strong>
              <span className="muted small">{exercise.equipment}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="section">
        <h2 className="section-title">Exercise detail</h2>
        <div className="exercise-detail-card">
          <div className="exercise-detail-row">
            <span className="badge">{selectedExercise.equipment}</span>
            <span className="badge">Primary: {selectedExercise.primary}</span>
          </div>
          <p className="muted small">Secondary: {selectedExercise.secondary}</p>
          <ul className="tip-list">
            {selectedExercise.tips.map((tip) => <li key={tip}>{tip}</li>)}
          </ul>
          <button
            className="cta-btn accent"
            type="button"
            onClick={() => window.alert(`Add ${selectedExercise.name} to a template in the next step.`)}
          >
            Add to Template
          </button>
        </div>
      </div>
    </div>
  );
}