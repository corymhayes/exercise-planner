<script lang="ts">
    import { db, type Exercise } from "$lib/db/db";
    let { day_of_week, exercise, distance, completed } = $props();

    let all_exercises: Exercise[] = $state([]);

    const load_all_exercises = async () => {
        all_exercises = await db.exercise.orderBy("name").toArray();
    };

    import { getDay } from "$lib/utils";
    import settings from "$lib/settings.json";

    $effect(() => {
        load_all_exercises();
    });
</script>

<div class="grid grid-rows-[30px_60px] gap-x-5" style="grid-template-columns: 35px 1rem minmax(50px, 125px)">
    <div class="col-start-1 row-start-1 self-center justify-self-end text-right text-sm">
        {getDay(day_of_week)}
    </div>

    {#each all_exercises as e}
        {#if exercise === e.name}
            <div class="col-start-2 row-start-1 h-4 w-4 self-center justify-self-center rounded-full {completed ? 'opacity-20' : null}" style="background-color: {e.color}"></div>
        {/if}
    {/each}

    <div class="col-start-3 row-start-1 self-center justify-self-start text-lg font-normal {completed ? 'line-through decoration-2' : null}">
        {exercise}
    </div>

    {#if exercise === "Run" || exercise === "Long Run" || exercise === "Short Run"}
        <div class="col-start-3 row-start-2 self-start text-sm">
            {distance}
            {settings.units}
        </div>
    {:else if exercise === "Cross"}
        <div class="col-start-3 row-start-2 self-start text-sm">
            {distance} min
        </div>
    {/if}

    <div class="col-start-2 row-start-2 h-[60px] w-[1px] self-start justify-self-center bg-secondary"></div>
</div>
