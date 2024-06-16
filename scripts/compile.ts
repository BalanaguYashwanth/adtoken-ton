import * as fs from "fs";
import process from "process";
import { Cell } from "@ton/core";
import { compileFunc } from "@ton-community/func-js";

async function compileScript() {

  const compileResult = await compileFunc({
    targets: ["./contracts/main.fc"],
    sources: (x) => {
        return fs.readFileSync(x).toString("utf8")},
  });

  if (compileResult.status === "error") {
    console.log('---error----', compileResult.message);
    process.exit(1);
  }

  const hexArtifact = `build/main.compiled.json`;

  fs.writeFileSync(
    hexArtifact,
    JSON.stringify({
      hex: Cell.fromBoc(Buffer.from(compileResult.codeBoc, "base64"))[0]
        .toBoc()
        .toString("hex"),
    })
  );
}
compileScript();