<script lang="ts">
    import { db } from "$lib/db/db";
    import type { Exercise, Plan } from "$lib/db/db";

    import { Calendar, Person } from "svelte-radix";
    import DayTemplate from "$lib/components/DayTemplate.svelte";

    let all_plans: Plan[] = $state([]);
    let all_exercises: Exercise[] = $state([]);
    let unique_week_nums: number[] = $state([]);

    const load_all_plans = async () => {
        all_plans = await db.plan.orderBy("day_of_week").toArray();
        all_exercises = await db.exercise.orderBy("name").toArray();
        unique_week_nums = await db.plan.orderBy("week_num").uniqueKeys((key) => key);
    };

    $effect(() => {
        load_all_plans();
    });

    const day_done = async (id: number) => {
        let current = await db.plan.where("id").equals(id).toArray();
        await db.plan.update(id, { completed: !current[0].completed });
        load_all_plans();
    };
</script>

<div class="flex justify-center gap-10 p-5 sm:mr-20">
    <nav class="fixed right-3 top-5 flex h-screen w-10 flex-col items-center gap-4">
        <a href="./admin"><Calendar size={24} /></a>
        <a href="./settings"><Person size={24} /></a>
    </nav>
    <div>
        {#each unique_week_nums as num}
            <main class="flex items-center justify-center">
                <h1 class="w-25 sticky top-3 mb-16 mr-8 self-start text-2xl font-bold text-primary-foreground" style="writing-mode: vertical-rl; text-orientation: mixed">
                    Week {num}
                </h1>
                <div class="flex flex-col">
                    {#each all_plans as plans}
                        {#if plans.week_num === num}
                            <div class="cursor-pointer" onclick={() => day_done(plans.id)}>
                                <DayTemplate day_of_week={plans.day_of_week} exercise={plans.exercise} distance={plans.distance} completed={plans.completed} />
                            </div>
                        {/if}
                    {/each}
                </div>
            </main>
        {/each}
    </div>
</div>
