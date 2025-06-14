import { exerciseList, getExercisesByType, getExercisesByWeight, getRandomExercise } from "./exercise_list.js";

// Individual exercise instance for tracking sets/reps/weight
class ExerciseInstance {
    constructor(exercise) {
        this.exercise = exercise;
        this.sets = [];
        this.notes = '';
        this.completed = false;
    }
    
    addSet(reps, weight = 0, restTime = 0) {
        const set = {
            reps: reps,
            weight: weight,
            restTime: restTime,
            timestamp: new Date()
        };
        this.sets.push(set);
        console.log(`Added set: ${reps} reps @ ${weight}lbs`);
        return set;
    }
    
    removeLastSet() {
        if (this.sets.length > 0) {
            const removedSet = this.sets.pop();
            console.log('Removed last set:', removedSet);
            return removedSet;
        }
    }
    
    getTotalVolume() {
        return this.sets.reduce((total, set) => total + (set.reps * set.weight), 0);
    }
    
    markCompleted() {
        this.completed = true;
        console.log(`${this.exercise.name} marked as completed`);
    }
}

class Session {
    constructor(type, customName = null) {
        this.id = Date.now();
        this.name = customName || `${type} Workout - ${new Date().toLocaleDateString()}`;
        this.type = type;
        this.exercises = [];
        this.startTime = null;
        this.endTime = null;
        this.duration = 0;
        this.completed = false;
        this.notes = '';
        
        console.log(`Created new session: ${this.name}`);
    }
    
    // Add exercises to the session
    addExercisesToSession(exerciseNames = [], count = 5) {
        if (exerciseNames.length > 0) {
            // Add specific exercises by name
            exerciseNames.forEach(name => {
                const exercise = exerciseList.find(ex => ex.name.toLowerCase() === name.toLowerCase());
                if (exercise) {
                    this.exercises.push(new ExerciseInstance(exercise));
                    console.log(`Added ${exercise.name} to session`);
                } else {
                    console.log(`Exercise "${name}" not found`);
                }
            });
        } else {
            // Auto-generate exercises by type
            const typeExercises = getExercisesByType(this.type);
            const selectedExercises = typeExercises.slice(0, count);
            
            selectedExercises.forEach(exercise => {
                this.exercises.push(new ExerciseInstance(exercise));
            });
            console.log(`Added ${selectedExercises.length} ${this.type} exercises to session`);
        }
    }
    
    startSession() {
        this.startTime = new Date();
        console.log(`Session started at ${this.startTime.toLocaleTimeString()}`);
    }
    
    endSession() {
        if (!this.startTime) {
            console.log('Session not started yet');
            return;
        }
        
        this.endTime = new Date();
        this.duration = Math.round((this.endTime - this.startTime) / 1000 / 60); // minutes
        this.completed = true;
        console.log(`Session completed in ${this.duration} minutes`);
    }
    
    getExerciseByName(name) {
        return this.exercises.find(ex => ex.exercise.name.toLowerCase() === name.toLowerCase());
    }
    
    getTotalVolume() {
        return this.exercises.reduce((total, ex) => total + ex.getTotalVolume(), 0);
    }
    
    getCompletionPercentage() {
        if (this.exercises.length === 0) return 0;
        const completed = this.exercises.filter(ex => ex.completed).length;
        return Math.round((completed / this.exercises.length) * 100);
    }
    
    getSummary() {
        const summary = {
            name: this.name,
            type: this.type,
            duration: this.duration,
            totalVolume: this.getTotalVolume(),
            exerciseCount: this.exercises.length,
            completionPercentage: this.getCompletionPercentage(),
            date: this.startTime ? this.startTime.toLocaleDateString() : 'Not started'
        };
        console.log('Session Summary:', summary);
        return summary;
    }
}


export { Session, ExerciseInstance };