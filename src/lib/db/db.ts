import Dexie, { type EntityTable } from "dexie";

interface Plan {
    id: number;
    week_num: number;
    day_of_week: number;
    exercise: string;
    distance: number;
    completed: boolean;
}

interface Settings {
    units: string;
}

interface Exercise {
    id: number;
    name: string;
    color: string;
}

const db = new Dexie("PlanDB") as Dexie & {
    plan: EntityTable<Plan, "id">;
    settings: EntityTable<Settings>;
    exercise: EntityTable<Exercise, "id">;
};

db.version(1).stores({
    plan: "++id, week_num, day_of_week, completed",
    settings: "units",
    exercise: "++id, name"
});

export type { Plan, Settings, Exercise };
export { db };
