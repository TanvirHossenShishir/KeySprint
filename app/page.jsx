import Link from "next/link";
import { AiOutlineThunderbolt } from "react-icons/ai";
import { TiGroupOutline } from "react-icons/ti";
import { CgGym } from "react-icons/cg";

const Home = () => {

  var getRoomID = () => {
    var id = "1";
    return id;
  }

  return (
    <div className="bg_dark h-screen px-28 py-5">
      <div className="flex text-center text-white gap-5 h-64">
        <Link href="/room/9" className="flex-1 rounded-3xl pt-10 bg_light">
          <div className="flex justify-center text-6xl pb-3 cl_orange">
            <CgGym />
          </div>
          <p className="text-4xl font-medium">Solo Play</p>
          <p className="text-lg font-normal m-3 cl_gray">Play on your own</p>
        </Link>
        <Link href="/" className="flex-1 rounded-3xl pt-10 bg_light">
          <div className="flex justify-center text-6xl pb-3 cl_teal">
            <AiOutlineThunderbolt />
          </div>
          <p className="text-4xl font-medium">Quick Play</p>
          <p className="text-lg font-normal m-3 cl_gray">Play against others</p>
        </Link>
        <a
          href={`/room/${getRoomID()}`}
          className="flex-1 rounded-3xl pt-10 bg_light"
        >
          <div className="flex justify-center text-6xl pb-3 cl_pink">
            <TiGroupOutline />
          </div>
          <p className="text-4xl font-medium">Group Play</p>
          <p className="text-lg font-normal m-3 cl_gray">
            Play against friends
          </p>
        </a>
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
