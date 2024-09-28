<script lang="ts">
    import { initial_data } from "$lib/db/data";
    import { db, type Exercise, type Plan } from "$lib/db/db";
    import { getDay, setDay } from "$lib/utils";

    import { Label } from "$lib/components/ui/label";
    import { Input } from "$lib/components/ui/input";
    import { Button } from "$lib/components/ui/button";
    import * as Card from "$lib/components/ui/card";
    import * as ToggleGroup from "$lib/components/ui/toggle-group";
    import * as Select from "$lib/components/ui/select";
    import * as Table from "$lib/components/ui/table";

    import { ArrowLeft, Pencil1, Cross2 } from "svelte-radix";

    let form_data = $state(structuredClone(initial_data));
    let loaded_id: number | undefined | null = $state(null);
    let all_plans: Plan[] = $state([]);
    let all_exercises: Exercise[] = $state([]);
    let unique_weeks = $state([]);
    let value = $state([]);
    let selectedType = $state("");

    let save = async () => {
        let form = $state.snapshot(form_data);
        // let days = $state.snapshot(value).map((i) => setDay(i));
        let days = $state.snapshot(value);
        let type = $state.snapshot(selectedType);

        if (!loaded_id) {
            for (const i in days) {
                await db.plan.add({
                    week_num: form.week_num,
                    day_of_week: setDay(days[i]),
                    distance: form.distance,
                    exercise: type,
                    completed: false
                });
            }
        } else {
            await db.plan.update(loaded_id, {
                week_num: form.week_num,
                day_of_week: setDay(days),
                distance: form.distance,
                exercise: type,
                completed: false
            });
        }

        reset_form();
        load_all_plans();
    };

    const load_all_plans = async () => {
        all_plans = await db.plan.orderBy("day_of_week").toArray();
        all_exercises = await db.exercise.orderBy("name").toArray();
        unique_weeks = await db.plan.orderBy("week_num").uniqueKeys((key) => key);
    };

    let reset_form = () => {
        loaded_id = null;
        value = [];
        selectedType = "";
        form_data.week_num = 1;
        form_data.distance = 0;
    };

    async function load_day(id: number) {
        const selected_day = await db.plan.get(id);

        if (selected_day) {
            form_data = selected_day;
            value = getDay(selected_day.day_of_week);
            selectedType = selected_day.exercise;
            loaded_id = selected_day.id;
        }
    }

    async function remove_day() {
        await db.plan.delete(loaded_id);

        load_all_plans();
        reset_form();
    }

    $effect(() => {
        load_all_plans();
    });
</script>

<div class="mt-10 flex flex-col justify-center gap-10 px-3 sm:flex-row">
    <div>
        <a href="./"> <ArrowLeft class="mb-7" /></a>

        <div class="flex gap-3">
            <h3 class="mb-5 scroll-m-20 text-2xl font-semibold tracking-tight">Schedule</h3>
        </div>

        <Card.Root>
            <Card.Header>
                <Card.Title>Add Day</Card.Title>
                <Card.Description>Add a workout to a day, or multiple days, to your schedule</Card.Description>
            </Card.Header>
            <Card.Content class="flex flex-col gap-4">
                <ToggleGroup.Root variant="outline" type="multiple" bind:value>
                    <ToggleGroup.Item value="Mon" class="w-[50px] rounded">M</ToggleGroup.Item>
                    <ToggleGroup.Item value="Tue" class="w-[50px] rounded">T</ToggleGroup.Item>
                    <ToggleGroup.Item value="Wed" class="w-[50px] rounded">W</ToggleGroup.Item>
                    <ToggleGroup.Item value="Thu" class="w-[50px] rounded">T</ToggleGroup.Item>
                    <ToggleGroup.Item value="Fri" class="w-[50px] rounded">F</ToggleGroup.Item>
                    <ToggleGroup.Item value="Sat" class="w-[50px] rounded">S</ToggleGroup.Item>
                    <ToggleGroup.Item value="Sun" class="w-[50px] rounded">S</ToggleGroup.Item>
                </ToggleGroup.Root>

                <div class="flex justify-between">
                    <div class="grid w-[9.5rem] gap-1.5">
                        <Label for="week_num">Week Num</Label>
                        <Input type="number" inputmode="numeric" id="week_num" bind:value={form_data.week_num} />
                    </div>

                    <div class="grid w-[9.5rem] gap-1.5">
                        <Label for="distance">Distance/Duration</Label>
                        <Input type="text" id="distance" inputmode="decimal" bind:value={form_data.distance} />
                    </div>
                </div>

                <div class="grid gap-1.5">
                    <Label for="type">Type</Label>
                    <Select.Root selected={selectedType} onSelectedChange={(v) => (selectedType = v.value)}>
                        <Select.Trigger>
                            <Select.Value placeholder={selectedType ? selectedType : ""} />
                        </Select.Trigger>
                        <Select.Content>
                            {#if all_exercises.length === 0}
                                <Select.Item>No exercises found</Select.Item>
                            {:else}
                                {#each all_exercises as exercise}
                                    <Select.Item value={exercise.name}>{exercise.name}</Select.Item>
                                {/each}
                            {/if}
                        </Select.Content>
                    </Select.Root>
                </div>

                <div class="flex flex-col">
                    <div class="flex justify-between">
                        <Button class="mt-5 w-[48%]" onclick={save}>Save</Button>
                        <Button class="mt-5 w-[48%]" variant="outline" onclick={reset_form}>Cancel</Button>
                    </div>
                    <div>
                        {#if loaded_id}
                            <Button class="mt-5 w-full" variant="destructive" onclick={remove_day}>Delete</Button>
                        {/if}
                    </div>
                </div>
            </Card.Content>
        </Card.Root>
    </div>

    <Card.Root class="mb-7">
        <Card.Header>
            <Card.Title>Schedule Overview</Card.Title>
            <Card.Description>A brief overview of your current schedule</Card.Description>
        </Card.Header>
        <Card.Content>
            {#each unique_weeks as week}
                <h4>Week {week}</h4>
                <Table.Root class="mb-10">
                    <Table.Header>
                        <Table.Row>
                            <Table.Head class="w-[15%]">Day</Table.Head>
                            <Table.Head class="w-[45%]">Type</Table.Head>
                            <Table.Head class="w-[15%]">Distance</Table.Head>
                            <Table.Head class="w-[25%]"></Table.Head>
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>
                        {#each all_plans as plans}
                            {#if plans.week_num === week}
                                <Table.Row>
                                    <Table.Cell>{getDay(plans.day_of_week)}</Table.Cell>
                                    <Table.Cell>{plans.exercise}</Table.Cell>
                                    <Table.Cell>{plans.distance}</Table.Cell>
                                    <Table.Cell class="flex gap-2">
                                        <Pencil1 class="cursor-pointer justify-self-end text-stone-700" size={18} onclick={() => load_day(plans.id)} />
                                        <Cross2 class="cursor-pointer justify-self-end text-stone-700" size={18} onclick={() => delete_exercise(exercise.id)} />
                                    </Table.Cell>
                                </Table.Row>
                            {/if}
                        {/each}
                    </Table.Body>
                </Table.Root>
            {/each}
        </Card.Content>
    </Card.Root>
</div>
