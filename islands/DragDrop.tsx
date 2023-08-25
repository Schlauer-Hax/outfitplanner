import { assert } from "$std/_util/asserts.ts";
import { ComponentChildren, Fragment } from "preact";

interface Props {
  children: ComponentChildren;
  names: string[];
}

function DragDropTable({ children, names }: Props) {
  let socket: WebSocket | null = null;
  const handleDragStart = (event: DragEvent) => {
    console.log("drag start");
    const target = event.target as HTMLImageElement;
    event.dataTransfer?.setData("text/plain", target.id);
  };

  const handleDrop = (event: DragEvent) => {
    event.preventDefault();
    const imageId = event.dataTransfer?.getData("text/plain");
    const target = event.target as HTMLElement;

    if (imageId && (target.tagName === "TD" || target.tagName === "DIV")) {
      const imageElement = document.getElementById(imageId);
      if (imageElement) {
        target.appendChild(imageElement);
        save();
      }
    }

    if (imageId && target.tagName === "IMG") {
      const imageElement = document.getElementById(imageId);
      if (imageElement) {
        target.parentElement?.appendChild(imageElement);
        save();
      }
    }
  };

  const handleDragOver = (event: DragEvent) => {
    event.preventDefault();
  };

  const save = () => {
    if (socket) {
      const out = Array.from(document.querySelectorAll(".clothpic")).map(
        (element) => {
          // id, parent class, position in parent
          assert(element.parentElement);
          if (element.parentElement.tagName === "DIV") {
            return [
              element.id,
              element.parentElement.id,
              Array.from(element.parentElement.children).indexOf(element),
            ];
          }
          assert(element.parentElement.parentElement);
          return [
            element.id,
            element.parentElement.parentElement.id,
            Array.from(element.parentElement.parentElement.children).indexOf(
              element.parentElement!,
            ),
          ];
        },
      );
      socket.send(JSON.stringify(out));
    }
  };

  const connect = () => {
    console.log("connecting");
    socket = new WebSocket(
      document.location.origin.replace("http", "ws") + "/api/change",
    );
    socket.onopen = (event) => {
      console.log("connected");
    };
    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      for (const [id, parent, position] of data) {
        const element = document.getElementById(id);
        if (element) {
          const parentElement = document.getElementById(parent);
          if (parentElement) {
            if (parentElement.tagName === "DIV") {
              parentElement.appendChild(element);
            } else {
              const target = parentElement.children[position];
              if (target) {
                target.appendChild(element);
              }
            }
          }
        }
      }
    };
    socket.onclose = (event) => {
      console.log("disconnected");
      socket = null;
      // try to reconnect
      setTimeout(() => {
        connect();
      }, 1000);
    }
  };

  const interval = setInterval(() => {
    if (typeof document !== "undefined") {
      if (!socket || socket.readyState === WebSocket.CLOSED) {
        connect();
        clearInterval(interval);
      }
    }
  }, 100);

  const days = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
  ];

  return (
    <Fragment>
      {/*put divs next to each other on the same line*/}
      <div
        class={"persons"}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragStart={handleDragStart}
      >
        {children}
      </div>

      <table
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragStart={handleDragStart}
        class="week-table"
      >
        <tbody>
          <tr>
            {days.map((day) => <th colSpan={names.length}>{day}</th>)}
          </tr>
          <tr>
            {Array(5).fill(0).map((x) => names).flat().map((name) => (
              <th>{name}</th>
            ))}
          </tr>
          <tr id="t">
            {Array(5*names.length).fill(0).map(() => <td></td>)}
          </tr>
          <tr id="s">
            {Array(5*names.length).fill(0).map(() => <td></td>)}
          </tr>
        </tbody>
      </table>
    </Fragment>
  );
}

export default DragDropTable;
