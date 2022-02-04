import {DynamoEntry} from "../src";
import {exampleCarTable} from "./example-table";
import {tableClient} from "./query-filter-expressions";

type Car = DynamoEntry<typeof exampleCarTable.definition>;

export async function getAllCars(): Promise<Car[]> {
    const result = await tableClient.scan();
    return result.member
}

export async function getAllCarsInYear2000(): Promise<Car[]> {
    const result = await tableClient.scan({filter: compare => compare().year.eq(2000)});
    return result.member
}


