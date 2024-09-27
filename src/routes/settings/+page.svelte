<script lang="ts">
    import { db, type Settings, type Exercise } from "$lib/db/db";
    import { settings_data, exercise_data } from "$lib/db/data";
    import { colors } from "$lib/colors.json";

    import * as Card from "$lib/components/ui/card";
    import * as RadioGroup from "$lib/components/ui/radio-group";
    import { Input } from "$lib/components/ui/input";
    import { Label } from "$lib/components/ui/label";
    import { Button } from "$lib/components/ui/button";
    import { ArrowLeft, Cross2, Pencil1 } from "svelte-radix";

    let exercise_form_data = $state(structuredClone(exercise_data));
    let all_exercises: Exercise[] = $state([]);
    let loaded_id = $state(0);
    let exercise_name = $state("");
    let exercise_color = $state("");

    let save = async () => {
        let name = $state.snapshot(exercise_name);
        let color = $state.snapshot(exercise_color);

        if (!loaded_id) {
            await db.exercise.add({
                name: name,
                color: color
            });
        } else {
            await db.exercise.update(loaded_id, {
                name: name,
                color: color
            });
        }

        reset_form();
        load_all_exercises();
    };

    const reset_form = async () => {
        exercise_name = "";
        exercise_color = "";
        loaded_id = null;
    };

    const load_all_exercises = async () => {
        all_exercises = await db.exercise.orderBy("name").toArray();
    };

    const edit_exercise = async (id: number) => {
        const selected_exercise = await db.exercise.get(id);

        if (selected_exercise) {
            loaded_id = selected_exercise.id;
            exercise_name = selected_exercise.name;
            exercise_color = selected_exercise.color;
        }
    };

    async function delete_exercise(id: number) {
        await db.exercise.delete(id);
        load_all_exercises();
    }

    $effect(() => {
        load_all_exercises();
    });
</script>

<div class="mt-10 flex flex-col justify-center px-3">
    <a href="./"><ArrowLeft class="mb-7" /></a>
    <h3 class="mb-7 scroll-m-20 text-2xl font-semibold tracking-tight">Preferences</h3>

    <Card.Root class="mb-7 py-3">
        <Card.Content class="flex items-center justify-between py-0">
            <h5 class="font-bold tracking-tight">Units</h5>
            <RadioGroup.Root value="mi" class="flex justify-evenly gap-6 p-3">
                <div class="flex items-center space-x-2">
                    <RadioGroup.Item value="mi" id="mi" />
                    <Label for="mi">mi</Label>
                </div>
                <div class="flex items-center space-x-2">
                    <RadioGroup.Item value="km" id="km" />
                    <Label for="km">km</Label>
                </div>
            </RadioGroup.Root>
        </Card.Content>
    </Card.Root>

    <Card.Root>
        <Card.Header>
            <Card.Title>Add an exercise</Card.Title>
            <Card.Description>Create an exercise to be used over the course of the coming weeks.</Card.Description>
        </Card.Header>
        <Card.Content>
            <div class="flex flex-col gap-7">
                <div class="grid w-full max-w-sm items-center gap-1.5">
                    <Label for="name">Name</Label>
                    <Input type="text" id="name" bind:value={exercise_name} />
                </div>

                <div class="flex max-w-sm flex-col gap-1.5">
                    <Label for="color">Color</Label>

                    <div class="grid grid-cols-6 grid-rows-3 gap-x-0 gap-y-3">
                        {#each colors as color}
                            {#if exercise_color === color}
                                <Button class="h-10 w-10 rounded-full border-2 border-white" style="background-color: {color}"></Button>
                            {:else}
                                <Button class="h-10 w-10 rounded-full" style="background-color: {color}" onclick={() => (exercise_color = color)}></Button>
                            {/if}
                        {/each}
                    </div>
                </div>
            </div>

            <div class="flex justify-between">
                <Button class="mt-10 w-[48%]" onclick={save}>Save</Button>
                {#if loaded_id}
                    <Button class="mt-10 w-[48%]" variant="outline" onclick={reset_form}>Cancel</Button>
                {/if}
            </div>
        </Card.Content>
    </Card.Root>

    <Card.Root class="my-7">
        <Card.Header>
            <Card.Title>Created exercises</Card.Title>
            <Card.Description>A list of your created exercises</Card.Description>
        </Card.Header>
        <Card.Content class="flex flex-col gap-3">
            {#each all_exercises as exercise}
                <div class="grid grid-cols-[3rem_5rem_5rem_2rem] items-center">
                    <div class="mr-7 h-4 w-4 rounded-full" style="background-color: {exercise.color}"></div>
                    <h1>{exercise.name}</h1>

                    <Pencil1 class="cursor-pointer justify-self-end text-stone-700" size={18} onclick={() => edit_exercise(exercise.id)} />
                    <Cross2 class="cursor-pointer justify-self-end text-stone-700" size={18} onclick={() => delete_exercise(exercise.id)} />
                </div>
            {/each}
        </Card.Content>
    </Card.Root>
</div>
