This folder contains files exporting ES6 functions used fetching and returning data from database

Example file structure:

```
import { PrismaClient } from "../../prismaClient";

export const getSomethingById = async (exampleId: string) => {

  const exampleResult =  await PrismaClient.example_table.findMany({
      where: { exampleWhere: exampleId },
      select: { id: true, otherField: true },
    });

  return exampleResult;
};

```
