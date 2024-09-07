"use client";
import { useState } from "react";
import Link from "next/link";
import { AiOutlineThunderbolt } from "react-icons/ai";
import { TiGroupOutline } from "react-icons/ti";
import { CgGym } from "react-icons/cg";
import { useRouter } from "next/navigation";

const Home = () => {
  const [roomId, setRoomId] = useState(null);
  const router = useRouter();

  const getRoomID = async () => {
    try {
      const response = await fetch("/api/createRoom", { method: "POST" });
      const data = await response.json();
      setRoomId(data.roomId);
      return data.roomId;
    } catch (error) {
      console.error("Failed to create room:", error);
    }
  };

  const handleGroupPlay = async () => {
    const id = await getRoomID();
    if (id) {
      router.push(`/room/${id}`);
    }
  };

  return (
    <div className="bg_dark h-screen px-28 py-5">
      <div className="flex text-center text-white gap-5 h-64">
        <Link href="/room/9" className="zoom flex-1 rounded-3xl pt-10 bg_light">
          <div className="flex justify-center text-6xl pb-3 cl_orange">
            <CgGym />
          </div>
          <p className="text-4xl font-medium">Solo Play</p>
          <p className="text-lg font-normal m-3 cl_gray">Play on your own</p>
        </Link>
        <Link href="/" className="zoom flex-1 rounded-3xl pt-10 bg_light">
          <div className="flex justify-center text-6xl pb-3 cl_teal">
            <AiOutlineThunderbolt />
          </div>
          <p className="text-4xl font-medium">Quick Play</p>
          <p className="text-lg font-normal m-3 cl_gray">Play against others</p>
        </Link>
        <div
          onClick={handleGroupPlay}
          className="zoom flex-1 rounded-3xl pt-10 bg_light cursor-pointer"
        >
          <div className="flex justify-center text-6xl pb-3 cl_pink">
            <TiGroupOutline />
          </div>
          <p className="text-4xl font-medium">Group Play</p>
          <p className="text-lg font-normal m-3 cl_gray">
            Play against friends
          </p>
        </div>
      </div>
      <div className="rounded-3xl mt-5 p-8 bg_light">
        <p className="text-4xl font-medium text-white pb-3">Leaderboard</p>
        <hr />
        <p className="pb-36"></p>
      </div>
    </div>
  );
};

export default Home;
