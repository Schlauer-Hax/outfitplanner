import { useSignal } from "@preact/signals";
import DragDropTable from "../islands/DragDrop.tsx";

export default function Home() {
  const persons = [];
  const components = [];

  for (const persondir of Deno.readDirSync("./static/clothes/")) {
    const person = persondir.name;
    persons.push(person);

    const clothes = Array.from(Deno.readDirSync(`./static/clothes/${person}`))
      .map((file) => file.name);

    components.push(
      <div>
        <h2 class={"persontext"}>{person}</h2>
        <div class={"person"} id={person}>
          {clothes.map((clothe) => (
            <img
              id={`${person}/${clothe}`}
              class="clothpic"
              src={`/clothes/${person}/${clothe}`}
              draggable={true}
              title={person}
            />
          ))}
        </div>
      </div>,
    );
  }

  return (
    <div class="px-4 py-8 mx-auto bg-[#86efac]">
      <div class="max-w-screen-md mx-auto flex flex-col items-center justify-center">
        <h1 class="text-4xl font-bold">Outfitplanner</h1>
        <DragDropTable names={persons}>
          {components}
        </DragDropTable>
      </div>
    </div>
  );
}
