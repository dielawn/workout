import { Session } from "./sessionClass";

class Trainee {
    constructor(name) {
        this.name = name;
        this.pastWorkouts = [];
        this.currentSession = null;
        this.workoutTypes = ['Upper body', 'Lower body', 'Full body', 'Core'];
        this.personalRecords = new Map(); // Track PRs for each exercise
        this.preferences = {
            defaultRestTime: 90, // seconds
            preferredWorkoutDuration: 45 // minutes
        };
        
        console.log(`Welcome ${name}! Trainee profile created.`);
    }
    
    startNewWorkout(type, customName = null, exerciseNames = []) {
        if (this.currentSession && !this.currentSession.completed) {
            console.log('You have an active session. Please complete or cancel it first.');
            return null;
        }
        
        this.currentSession = new Session(type, customName);
        this.currentSession.addExercisesToSession(exerciseNames);
        this.currentSession.startSession();
        
        return this.currentSession;
    }
    
    completeCurrentWorkout(notes = '') {
        if (!this.currentSession) {
            console.log('No active workout session');
            return;
        }
        
        this.currentSession.endSession();
        this.currentSession.notes = notes;
        
        // Check for new personal records
        this.checkForPersonalRecords(this.currentSession);
        
        // Save to history
        this.pastWorkouts.push(this.currentSession);
        console.log(`Workout completed and saved to history`);
        
        // Clear current session
        this.currentSession = null;
    }
    
    cancelCurrentWorkout() {
        if (this.currentSession) {
            console.log(`Cancelled workout: ${this.currentSession.name}`);
            this.currentSession = null;
        }
    }
    
    addSetToExercise(exerciseName, reps, weight = 0) {
        if (!this.currentSession) {
            console.log('No active workout session');
            return;
        }
        
        const exerciseInstance = this.currentSession.getExerciseByName(exerciseName);
        if (exerciseInstance) {
            const set = exerciseInstance.addSet(reps, weight, this.preferences.defaultRestTime);
            return set;
        } else {
            console.log(`Exercise "${exerciseName}" not found in current session`);
        }
    }
    
    markExerciseComplete(exerciseName) {
        if (!this.currentSession) {
            console.log('No active workout session');
            return;
        }
        
        const exerciseInstance = this.currentSession.getExerciseByName(exerciseName);
        if (exerciseInstance) {
            exerciseInstance.markCompleted();
        }
    }
    
    checkForPersonalRecords(session) {
        session.exercises.forEach(exerciseInstance => {
            const exerciseName = exerciseInstance.exercise.name;
            const maxWeight = Math.max(...exerciseInstance.sets.map(set => set.weight));
            const maxVolume = exerciseInstance.getTotalVolume();
            
            // Check weight PR
            const currentWeightPR = this.personalRecords.get(`${exerciseName}_weight`) || 0;
            if (maxWeight > currentWeightPR) {
                this.personalRecords.set(`${exerciseName}_weight`, maxWeight);
                console.log(`🎉 New weight PR for ${exerciseName}: ${maxWeight}lbs!`);
            }
            
            // Check volume PR
            const currentVolumePR = this.personalRecords.get(`${exerciseName}_volume`) || 0;
            if (maxVolume > currentVolumePR) {
                this.personalRecords.set(`${exerciseName}_volume`, maxVolume);
                console.log(`🎉 New volume PR for ${exerciseName}: ${maxVolume}lbs total!`);
            }
        });
    }
    
    getWorkoutHistory(limit = 10) {
        const recent = this.pastWorkouts.slice(-limit).reverse();
        console.log(`Last ${recent.length} workouts:`);
        recent.forEach((workout, index) => {
            console.log(`${index + 1}. ${workout.name} - ${workout.duration}min`);
        });
        return recent;
    }
    
    getStatsForExercise(exerciseName) {
        const allSets = [];
        
        this.pastWorkouts.forEach(workout => {
            const exerciseInstance = workout.exercises.find(ex => 
                ex.exercise.name.toLowerCase() === exerciseName.toLowerCase()
            );
            if (exerciseInstance) {
                allSets.push(...exerciseInstance.sets);
            }
        });
        
        if (allSets.length === 0) {
            console.log(`No history found for ${exerciseName}`);
            return null;
        }
        
        const stats = {
            totalSets: allSets.length,
            maxWeight: Math.max(...allSets.map(set => set.weight)),
            avgWeight: Math.round(allSets.reduce((sum, set) => sum + set.weight, 0) / allSets.length),
            totalVolume: allSets.reduce((sum, set) => sum + (set.reps * set.weight), 0)
        };
        
        console.log(`Stats for ${exerciseName}:`, stats);
        return stats;
    }
    
    getCurrentWorkoutStatus() {
        if (!this.currentSession) {
            console.log('No active workout');
            return null;
        }
        
        const status = {
            sessionName: this.currentSession.name,
            duration: this.currentSession.startTime ? 
                Math.round((new Date() - this.currentSession.startTime) / 1000 / 60) : 0,
            completionPercentage: this.currentSession.getCompletionPercentage(),
            exercisesRemaining: this.currentSession.exercises.filter(ex => !ex.completed).length
        };
        
        console.log('Current workout status:', status);
        return status;
    }
}

export default Trainee