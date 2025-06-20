import React, { useState, useEffect } from 'react';

import Trainee from '../../traineeClass';
import './Trainee.css';

const TraineeComponent = () => {
    const [trainees, setTrainees] = useState([]);
    const [currentTrainee, setCurrentTrainee] = useState(null);
    const [newTraineeName, setNewTraineeName] = useState('');
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [selectedWorkoutType, setSelectedWorkoutType] = useState('Upper body');
    const [setReps, setSetReps] = useState('');
    const [setWeight, setSetWeight] = useState('');
    const [selectedWorkoutForDetail, setSelectedWorkoutForDetail] = useState(null);
    const [showWorkoutModal, setShowWorkoutModal] = useState(false);
 

    // Load trainees from localStorage on component mount
    useEffect(() => {
        loadTraineesFromStorage();
        console.log('TraineeComponent loaded');
        
    }, []);

    // Save trainees to localStorage whenever trainees state changes
    useEffect(() => {
        if (trainees.length > 0) {
            saveTraineesToStorage();
            console.log('Trainees saved to localStorage');
        }
    }, [trainees]);

    useEffect(() => {
        console.log('selected type', selectedWorkoutType)
    }, [selectedWorkoutType])

    const loadTraineesFromStorage = () => {
        try {
            const savedTrainees = localStorage.getItem('fitness_trainees');
            if (savedTrainees) {
                const parsedTrainees = JSON.parse(savedTrainees);
                // Recreate Trainee instances from saved data
                const traineeInstances = parsedTrainees.map(data => {
                    const trainee = new Trainee(data.name);
                    trainee.pastWorkouts = data.pastWorkouts || [];
                    trainee.personalRecords = new Map(data.personalRecords || []);
                    trainee.preferences = data.preferences || trainee.preferences;
                    return trainee;
                });
                setTrainees(traineeInstances);
                console.log(`Loaded ${traineeInstances.length} trainees from storage`);
            }
        } catch (error) {
            console.error('Error loading trainees from localStorage:', error);
        }
    };

    const saveTraineesToStorage = () => {
        try {
            // Convert trainee instances to plain objects for storage
            const traineeData = trainees.map(trainee => ({
                name: trainee.name,
                pastWorkouts: trainee.pastWorkouts,
                personalRecords: Array.from(trainee.personalRecords.entries()),
                preferences: trainee.preferences
            }));
            localStorage.setItem('fitness_trainees', JSON.stringify(traineeData));
        } catch (error) {
            console.error('Error saving trainees to localStorage:', error);
        }
    };

    const createNewTrainee = () => {
        if (newTraineeName.trim()) {
            const newTrainee = new Trainee(newTraineeName.trim());
            setTrainees([...trainees, newTrainee]);
            setNewTraineeName('');
            setShowCreateForm(false);
            setCurrentTrainee(newTrainee);
            console.log(`Created new trainee: ${newTrainee.name}`);
        }
    };

    const selectTrainee = (trainee) => {
        setCurrentTrainee(trainee);
        console.log(`Selected trainee: ${trainee.name}`);
    };

    const startWorkout = () => {
        if (currentTrainee) {
            const session = currentTrainee.startNewWorkout(selectedWorkoutType);
            updateTraineeInState(currentTrainee);
            console.log(`Started ${selectedWorkoutType} workout`);
        }
    };

    const addSetToExercise = (exerciseName, reps, weight = 0) => {
        if (currentTrainee && currentTrainee.currentSession) {
            currentTrainee.addSetToExercise(exerciseName, reps, weight);
            updateTraineeInState(currentTrainee);
            console.log(`Added set: ${reps} reps @ ${weight}lbs for ${exerciseName}`);
        }
    };

    const completeExercise = (exerciseName) => {
        if (currentTrainee) {
            currentTrainee.markExerciseComplete(exerciseName);
            updateTraineeInState(currentTrainee);
        }
    };

    const completeWorkout = () => {
        if (currentTrainee && currentTrainee.currentSession) {
            currentTrainee.completeCurrentWorkout('Completed via React app');
            updateTraineeInState(currentTrainee);
        }
    };

    const updateTraineeInState = (updatedTrainee) => {
        setTrainees(prevTrainees => 
            prevTrainees.map(t => t.name === updatedTrainee.name ? updatedTrainee : t)
        );
    };

    const deleteTrainee = (traineeToDelete) => {
        setTrainees(prevTrainees => prevTrainees.filter(t => t.name !== traineeToDelete.name));
        if (currentTrainee && currentTrainee.name === traineeToDelete.name) {
            setCurrentTrainee(null);
        }
        console.log(`Deleted trainee: ${traineeToDelete.name}`);
    };

    const getCurrentExercises = () => {
        return currentTrainee?.currentSession?.exercises || [];
    };

        const WorkoutDetailModal = ({ workout, onClose }) => {
        if (!workout) return null;
        
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
    const viewWorkoutDetails = (workout) => {
        console.log('Viewing detailed workout:', workout);
        setSelectedWorkoutForDetail(workout);
        setShowWorkoutModal(true);
    };

    const closeWorkoutModal = () => {
        setShowWorkoutModal(false);
        setSelectedWorkoutForDetail(null);
    };

    return (
        <div className="trainee-container">
            <header className="app-header">
                <h1>💪 Fitness Tracker</h1>
                {currentTrainee && (
                    <div className="current-trainee-info">
                        <span>Welcome back, {currentTrainee.name}!</span>
                        <button 
                            className="btn-secondary"
                            onClick={() => setCurrentTrainee(null)}
                        >
                            Switch User
                        </button>
                    </div>
                )}
            </header>

            {!currentTrainee ? (
                <div className="trainee-selection">
                    <h2>Select or Create Trainee</h2>
                    
                    {trainees.length > 0 && (
                        <div className="existing-trainees">
                            <h3>Existing Trainees:</h3>
                            <div className="trainee-grid">
                                {trainees.map((trainee, index) => (
                                    <div key={index} className="trainee-card">
                                        <div className="trainee-info">
                                            <h4>{trainee.name}</h4>
                                            <p>{trainee.pastWorkouts.length} workouts completed</p>
                                            <p>Joined: {new Date(trainee.pastWorkouts[0]?.startTime || Date.now()).toLocaleDateString()}</p>
                                        </div>
                                        <div className="trainee-actions">
                                            <button 
                                                className="btn-primary"
                                                onClick={() => selectTrainee(trainee)}
                                            >
                                                Select
                                            </button>
                                            <button 
                                                className="btn-danger"
                                                onClick={() => deleteTrainee(trainee)}
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="create-trainee-section">
                        {!showCreateForm ? (
                            <button 
                                className="btn-primary btn-large"
                                onClick={() => setShowCreateForm(true)}
                            >
                                + Create New Trainee
                            </button>
                        ) : (
                            <div className="create-form">
                                <h3>Create New Trainee</h3>
                                <div className="form-group">
                                    <input
                                        type="text"
                                        placeholder="Enter trainee name"
                                        value={newTraineeName}
                                        onChange={(e) => setNewTraineeName(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && createNewTrainee()}
                                    />
                                </div>
                                <div className="form-actions">
                                    <button 
                                        className="btn-primary"
                                        onClick={createNewTrainee}
                                        disabled={!newTraineeName.trim()}
                                    >
                                        Create
                                    </button>
                                    <button 
                                        className="btn-secondary"
                                        onClick={() => {
                                            setShowCreateForm(false);
                                            setNewTraineeName('');
                                        }}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <div className="trainee-dashboard">
                    <div className="dashboard-grid">
                        
                        <div className="section current-workout">
                            <h3>Current Workout</h3>
                            
                            {!currentTrainee.currentSession ? (
                                <div className="start-workout">
                                    <p>No active workout</p>
                                    <div className="form-group">
                                        <label>Workout Type:</label>
                                        <select 
                                            value={selectedWorkoutType}
                                            onChange={(e) => setSelectedWorkoutType(e.target.value)}
                                        >
                                            {currentTrainee.workoutTypes.map(type => (
                                                <option key={type} value={type}>{type}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <button 
                                        className="btn-primary"
                                        onClick={startWorkout}
                                    >
                                        Start Workout
                                    </button>
                                </div>
                            ) : (
                                <div className="active-workout">
                                    <div className="workout-header">
                                        <h4>{currentTrainee.currentSession.name}</h4>
                                        <p>Duration: {Math.round((new Date() - currentTrainee.currentSession.startTime) / 1000 / 60)} min</p>
                                        <p>Progress: {currentTrainee.currentSession.getCompletionPercentage()}%</p>
                                    </div>
                                    
                                    <div className="exercises-list">
                                        {getCurrentExercises().map((exerciseInstance, index) => (
                                            <div key={index} className={`exercise-item ${exerciseInstance.completed ? 'completed' : ''}`}>
                                                <div className="exercise-header">
                                                    <h5>{exerciseInstance.exercise.name}</h5>
                                                    <span className="exercise-type">{exerciseInstance.exercise.type}</span>
                                                </div>
                                                <p className="exercise-description">{exerciseInstance.exercise.description}</p>
                                                
                                                {exerciseInstance.sets.length > 0 && (
                                                    <div className="sets-display">
                                                        <strong>Sets:</strong>
                                                        {exerciseInstance.sets.map((set, setIndex) => (
                                                            <span key={setIndex} className="set-badge">
                                                                {set.reps}×{set.weight}lbs
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
                                                
                                                {!exerciseInstance.completed && (
                                                    <div className="exercise-controls">
                                                        <div className="add-set-inline">
                                                            <div className="inline-inputs">
                                                                <input
                                                                    type="number"
                                                                    placeholder="Reps"
                                                                    value={setReps}
                                                                    onChange={(e) => setSetReps(e.target.value)}
                                                                    className="inline-input"
                                                                />
                                                                <input
                                                                    type="number"
                                                                    placeholder="Weight"
                                                                    value={setWeight}
                                                                    onChange={(e) => setSetWeight(e.target.value)}
                                                                    className="inline-input"
                                                                />
                                                                <button 
                                                                    className="btn-primary btn-small"
                                                                    onClick={() => {
                                                                        if (setReps) {
                                                                            addSetToExercise(exerciseInstance.exercise.name, parseInt(setReps), parseFloat(setWeight) || 0);
                                                                            setSetReps('');
                                                                            setSetWeight('');
                                                                        }
                                                                    }}
                                                                    disabled={!setReps}
                                                                >
                                                                    Add Set
                                                                </button>
                                                            </div>
                                                        </div>
                                                        <button 
                                                            className="btn-success btn-small"
                                                            onClick={() => completeExercise(exerciseInstance.exercise.name)}
                                                        >
                                                            Mark Complete
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                    
                                    <button 
                                        className="btn-primary"
                                        onClick={completeWorkout}
                                    >
                                        Complete Workout
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="section stats">
                            <h3>Your Stats</h3>
                            <div className="stats-grid">
                                <div className="stat-item">
                                    <span className="stat-number">{currentTrainee.pastWorkouts.length}</span>
                                    <span className="stat-label">Total Workouts</span>
                                </div>
                                <div className="stat-item">
                                    <span className="stat-number">{currentTrainee.personalRecords.size}</span>
                                    <span className="stat-label">Personal Records</span>
                                </div>
                                <div className="stat-item">
                                    <span className="stat-number">
                                        {currentTrainee.pastWorkouts.reduce((total, workout) => total + (workout.duration || 0), 0)}
                                    </span>
                                    <span className="stat-label">Total Minutes</span>
                                </div>
                            </div>
                        </div>

                        <div className="section recent-workouts">
                            <h3>Recent Workouts</h3>
                            {currentTrainee.pastWorkouts.length === 0 ? (
                                <p>No workouts completed yet</p>
                            ) : (
                                <div className="workouts-list">
                                    {currentTrainee.pastWorkouts.slice(-5).reverse().map((workout, index) => (
                                        <div key={index} className="workout-item">
                                            <div className="workout-info">
                                                <h5>{workout.name}</h5>
                                                <p>{workout.duration} min • {workout.exercises?.length || 0} exercises</p>
                                            </div>
                                            <div className="workout-actions">
                                                <span className="workout-date">
                                                    {new Date(workout.startTime).toLocaleDateString()}
                                                </span>
                                                <button 
                                                    className="btn-primary btn-small"
                                                    onClick={() => viewWorkoutDetails(workout)}
                                                    style={{ marginLeft: '10px' }}
                                                >
                                                    View Details
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="section personal-records">
                            <h3>Max Weight PRs</h3>
                            {currentTrainee.personalRecords.size === 0 ? (
                                <p>Complete more workouts to set personal records!</p>
                            ) : (
                                <div className="records-list">
                                    {(() => {
                                        const weightRecords = Array.from(currentTrainee.personalRecords.entries())
                                            .filter(([key]) => key.includes('_weight'))
                                            .sort((a, b) => b[1] - a[1]) // Sort by weight value, highest first
                                            ; // Show top 8 instead of 5
                                        
                                        console.log('Top weight records (sorted):', weightRecords);
                                        
                                        return weightRecords.map(([key, value], index) => {
                                            const exerciseName = key.replace('_weight', '');
                                            return (
                                                <div key={index} className="record-item">
                                                    <span className="record-exercise">{exerciseName}</span>
                                                    <span className="record-value">{value}lbs</span>
                                                </div>
                                            );
                                        });
                                    })()}
                                </div>
                            )}
                        </div>

                        <div className="section quick-actions">
                            <h3>Quick Actions</h3>
                            <div className="action-buttons">
                                <button 
                                    className="btn-secondary"
                                    onClick={() => {
                                        const lastWorkout = currentTrainee.pastWorkouts[currentTrainee.pastWorkouts.length - 1];
                                        if (lastWorkout) {
                                            viewWorkoutDetails(lastWorkout);
                                        } else {
                                            console.log('No workouts found');
                                        }
                                    }}
                                >
                                    View Last Workout Details
                                </button>
                                                                
                                <button 
                                    className="btn-secondary"
                                    onClick={() => {
                                        const exercises = ['Bench Press', 'Bicep Curls', 'Squats'];
                                        exercises.forEach(exercise => {
                                            currentTrainee.getStatsForExercise?.(exercise);
                                        });
                                    }}
                                >
                                    View Exercise Stats
                                </button>
                                
                                <button 
                                    className="btn-secondary"
                                    onClick={() => {
                                        currentTrainee.getWorkoutHistory?.(10);
                                    }}
                                >
                                    Full History
                                </button>
                            </div>
                        </div>

                        <div className="section workout-suggestions">
                            <h3>Suggested Next Workout</h3>
                            {(() => {
                                const lastWorkout = currentTrainee.pastWorkouts[currentTrainee.pastWorkouts.length - 1];
                                let suggestion = 'Upper body';
                                
                                if (lastWorkout) {
                                    switch (lastWorkout.type) {
                                        case 'Upper body':
                                            suggestion = 'Lower body';
                                            break;
                                        case 'Lower body':
                                            suggestion = 'Core';
                                            break;
                                        case 'Core':
                                            suggestion = 'Full body';
                                            break;
                                        default:
                                            suggestion = 'Upper body';
                                    }
                                }
                                
                                return (
                                    <div className="suggestion-content">
                                        <p>Based on your last workout, we suggest: <strong>{suggestion}</strong></p>
                                        <button 
                                            className="btn-primary"
                                            onClick={() => {
                                                setSelectedWorkoutType(suggestion);
                                                if (!currentTrainee.currentSession) {
                                                    startWorkout();
                                                }
                                            }}
                                        >
                                            Start {suggestion} Workout
                                        </button>
                                    </div>
                                );
                            })()}
                        </div>
                    </div>
                </div>
            )}
            
            <div className="global-actions">
                <button 
                    className="btn-secondary"
                    onClick={() => {
                        if (window.confirm('This will clear ALL trainee data. Are you sure?')) {
                            localStorage.removeItem('fitness_trainees');
                            setTrainees([]);
                            setCurrentTrainee(null);
                            console.log('All data cleared');
                        }
                    }}
                >
                    Clear All Data
                </button>
                
                <button 
                    className="btn-secondary"
                    onClick={() => {
                        const data = {
                            trainees: trainees.map(trainee => ({
                                name: trainee.name,
                                pastWorkouts: trainee.pastWorkouts,
                                personalRecords: Array.from(trainee.personalRecords.entries()),
                                preferences: trainee.preferences
                            })),
                            exportDate: new Date().toISOString()
                        };
                        
                        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `fitness-data-${new Date().toISOString().split('T')[0]}.json`;
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                        URL.revokeObjectURL(url);
                        
                        console.log('Data exported successfully');
                    }}
                >
                    Export Data
                </button>
            </div>
            {showWorkoutModal && (
                <WorkoutDetailModal 
                    workout={selectedWorkoutForDetail} 
                    onClose={closeWorkoutModal} 
                />
            )}
        </div>
    )
}

export default TraineeComponent