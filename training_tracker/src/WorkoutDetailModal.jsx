const WorkoutDetailModal = ({ workout, onClose }) => {
    if (!workout) return null;
    
    // Create detailed summary from workout data
    const getWorkoutDetails = (workout) => {
        const exerciseDetails = workout.exercises?.map(exerciseInstance => ({
            name: exerciseInstance.exercise.name,
            type: exerciseInstance.exercise.type,
            description: exerciseInstance.exercise.description,
            completed: exerciseInstance.completed,
            sets: exerciseInstance.sets || [],
            totalVolume: exerciseInstance.sets?.reduce((total, set) => total + (set.reps * set.weight), 0) || 0,
            maxWeight: exerciseInstance.sets?.length > 0 ? Math.max(...exerciseInstance.sets.map(s => s.weight)) : 0
        })) || [];
        
        return {
            sessionInfo: {
                name: workout.name,
                type: workout.type,
                duration: workout.duration,
                date: new Date(workout.startTime || workout.endTime).toLocaleDateString(),
                notes: workout.notes || ''
            },
            stats: {
                totalVolume: exerciseDetails.reduce((total, ex) => total + ex.totalVolume, 0),
                totalSets: exerciseDetails.reduce((total, ex) => total + ex.sets.length, 0),
                completedExercises: exerciseDetails.filter(ex => ex.completed).length
            },
            exercises: exerciseDetails
        };
    };
    
    const details = getWorkoutDetails(workout);
    
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>{details.sessionInfo.name}</h2>
                    <button className="modal-close" onClick={onClose}>×</button>
                </div>
                
                <div className="modal-body">
                    <div className="workout-summary-stats">
                        <div className="summary-stat">
                            <span className="stat-label">Duration</span>
                            <span className="stat-value">{details.sessionInfo.duration} min</span>
                        </div>
                        <div className="summary-stat">
                            <span className="stat-label">Total Volume</span>
                            <span className="stat-value">{details.stats.totalVolume} lbs</span>
                        </div>
                        <div className="summary-stat">
                            <span className="stat-label">Total Sets</span>
                            <span className="stat-value">{details.stats.totalSets}</span>
                        </div>
                        <div className="summary-stat">
                            <span className="stat-label">Completed</span>
                            <span className="stat-value">{details.stats.completedExercises}/{details.exercises.length}</span>
                        </div>
                    </div>
                    
                    <div className="exercises-detail">
                        <h3>Exercise Details</h3>
                        {details.exercises.map((exercise, index) => (
                            <div key={index} className="exercise-detail-card">
                                <div className="exercise-detail-header">
                                    <h4>{exercise.name} {exercise.completed ? '✅' : '⏳'}</h4>
                                    <span className="exercise-type-badge">{exercise.type}</span>
                                </div>
                                
                                <p className="exercise-description">{exercise.description}</p>
                                
                                <div className="exercise-stats">
                                    <span>Sets: {exercise.sets.length}</span>
                                    <span>Volume: {exercise.totalVolume} lbs</span>
                                    <span>Max Weight: {exercise.maxWeight} lbs</span>
                                </div>
                                
                                {exercise.sets.length > 0 && (
                                    <div className="sets-breakdown">
                                        <h5>Sets:</h5>
                                        <div className="sets-grid">
                                            {exercise.sets.map((set, setIndex) => (
                                                <div key={setIndex} className="set-detail">
                                                    <span className="set-number">#{setIndex + 1}</span>
                                                    <span className="set-info">{set.reps} reps × {set.weight} lbs</span>
                                                    <span className="set-volume">= {set.reps * set.weight} lbs</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                    
                    {details.sessionInfo.notes && (
                        <div className="workout-notes">
                            <h4>Notes:</h4>
                            <p>{details.sessionInfo.notes}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default WorkoutDetailModal;