This folder contains files that are used to declare routers and their endpoints

Example router and endpoint:

```
const exampleRouter = Router();

exampleRouter.get(
  "/examplePath/:exampleVariable",
  async (req, res) => {
    const { exampleVariable } = req.params;

      ...

      res.send(something)
  },
);
```
