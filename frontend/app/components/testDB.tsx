"use client";

import { useState } from "react";

async function fetchData(url: string, params: RequestInit) {
  let resJSON;
  try {
    const response = await fetch(url, {
      ...params,
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    resJSON = await response.json();
    return resJSON;
  } catch (e) {
    document.write(`Got Error: ${e}`);
    console.log(e);
    return;
  }
}

type commentSceme = {
  id: number;
  name: string;
  comment: string;
};

export default function TestDB() {
  const [name, setName] = useState("");
  const [comment, setComment] = useState("");
  const [data, setData] = useState<commentSceme[]>([]);

  async function getData() {
    const url = "/api/comment";
    const params: RequestInit = {
      method: "GET",
    };
    const res = await fetchData(url, params);
    if (!res.ok) {
      document.write(`Got Error: ${res.error}`);
      console.log(res.error);
      return;
    }
    setData(res.data);
    console.log("got", res.data);
  }

  async function addData() {
    const url = "/api/comment";
    const params: RequestInit = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: name,
        comment: comment,
      }),
    };
    const res = await fetchData(url, params);
    if (!res) return;
    if (!res.ok) {
      document.write(`Got Error: ${res.error}`);
      console.log(res.error);
      return;
    }
    console.log("SENT: OK!");
    setName("");
    setComment("");
  }

  return (
    <div className="flex flex-col justify-center items-center gap-4">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (name === "" || comment === "") return;
          addData();
        }}
        className="flex flex-col items-center gap-4 justify-center"
      >
        <input
          type="text"
          value={name}
          placeholder="enter name.."
          onChange={(e) => setName(e.target.value)}
          className="bg-white text-black p-4 rounded-lg"
        />
        <input
          type="text"
          value={comment}
          placeholder="enter comment.."
          onChange={(e) => setComment(e.target.value)}
          className="bg-white text-black p-4 rounded-lg"
        />
        <button className="bg-blue-300 text-black p-4 rounded-md">Add</button>
      </form>
      <button
        onClick={getData}
        className="bg-blue-300 text-black p-4 rounded-md"
      >
        Get
      </button>
      <div className="flex flex-col gap-4 mt-12">
        {data &&
          data.map((comment) => {
            return (
              <div
                key={comment.id}
                className="outline p-4 rounded-md flex flex-col gap-4"
              >
                <p>{comment.name}</p>
                <p>
                  {">> "}
                  {comment.comment}
                </p>
              </div>
            );
          })}
      </div>
    </div>
  );
}
