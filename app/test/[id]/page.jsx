import Link from "next/link";

const Deck = () => {
  var getRoomID = () => {
    var id = "dashboard";
    return id;
  };

  return (
    <div className="bg_dark h-screen px-28 py-5">
      <div className="flex text-white gap-5">
        <div className="rounded-3xl p-5 bg_light w-2/5">
          <div className="flex justify-center">
            <p className="cl_gray text-lg pl-1 pr-3 py-1">You: </p>
            <input
              placeholder="Enter your username..."
              className="text-lg bg-zinc-800 rounded-lg px-3 py-1 w-full focus:outline-none"
            />
          </div>

          <p className="text-lg font-normal mt-3 cl_gray">
            Punctuation: ON / OFF
          </p>
        </div>
        <div className="rounded-3xl p-5 bg_light w-1/5">
          <p className="text-3xl text-center font-medium pb-2 cl_gray">1 / 8</p>
          <p className="text-xl text-center cl_pink font-bold bg_dark rounded-md p-1">
            START GAME
          </p>
        </div>
        <div className="rounded-3xl p-5 bg_light w-2/5">
          <p className="text-lg font-normal my-3 cl_gray">
            Share this link to invite your friends:
            http://localhost:3000/room/b332yi
          </p>
        </div>
      </div>

      <div className="flex text-white gap-5">
        <div className="rounded-3xl mt-5 px-5 py-3 bg_light w-full h-72">
          <p className="text-2xl mb-2 font-medium text-white">Chat</p>

          <div className="border mb-2 px-3 py-2 rounded-lg h-44 border-zinc-600">
            User1 joined the room.
          </div>

          <input
            placeholder="Write a message..."
            className="text-lg bg-zinc-800 rounded-lg px-3 py-1 w-full focus:outline-none"
          />
        </div>
        <div className="rounded-3xl mt-5 px-5 py-3 bg_light w-full h-72">
          <p className="text-2xl mb-3 font-medium text-white">Players detail</p>
          <div class="grid grid-cols-2 gap-2">
            <div className="flex justify-between items-center bg-zinc-800 px-3 py-2 rounded-lg h-12">
              <p className="truncate">User1</p>
              <div className="flex gap-2 justify-between w-20">
                <div className="text-center">
                  <p className="text-[12px] text-zinc-400">WPM</p>
                  <p className="text-sm text-zinc-200">60</p>
                </div>
                <div className="text-center">
                  <p className="text-[12px] text-zinc-400">ACCURACY</p>
                  <p className="text-sm text-zinc-200">97%</p>
                </div>
              </div>
            </div>
            <div className="bg-zinc-800 p-3 rounded-lg h-12"></div>
            <div className="bg-zinc-800 p-3 rounded-lg h-12"></div>
            <div className="bg-zinc-800 p-3 rounded-lg h-12"></div>
            <div className="bg-zinc-800 p-3 rounded-lg h-12"></div>
            <div className="bg-zinc-800 p-3 rounded-lg h-12"></div>
            <div className="bg-zinc-800 p-3 rounded-lg h-12"></div>
            <div className="bg-zinc-800 p-3 rounded-lg h-12"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Deck;
