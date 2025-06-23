import Link from "next/link";
import React from "react";

const Home = () => {
    return (
        <div>
            <div>
                <b>Welcome to Offroad!</b>
                <div>
                    <Link href={"/login"}>Login</Link>
                </div>
                <div>
                    <Link href={"/apply"}>Apply as Mechanic</Link>
                </div>
            </div>
            <div>
                Type of car:
                <div>car1</div>
                <div>car2</div>
                <div>car3</div>
            </div>
        </div>
    );
};

export default Home;
