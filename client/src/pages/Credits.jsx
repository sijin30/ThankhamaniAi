import React, { useState, useEffect } from "react";
import { dummyPlans } from "../assets/assets";
import Loading from "../pages/Loading";

function Credits() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  const fetchPlans = async () => {
    setPlans(dummyPlans);
    setLoading(false);
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  if (loading) return <Loading />;

  return (
    <div className="max-w-7xl h-screen overflow-y-scroll mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h2 className="text-3xl font-semibold text-center mb-10 xl:mt-30 text-gray-800 dark:text-white">
        Credit Plans
      </h2>

      <div className="flex flex-wrap justify-center items-center gap-8">
        {plans.map((plan) => (
          <div
            key={plan._id}
            onClick={() => setSelected(plan._id)}
            className={`flex-1 min-w-[300px] max-w-[350px] h-[440px] flex flex-col cursor-pointer
              border rounded-lg shadow p-6 transition-all duration-200
              ${
                selected === plan._id
                  ? "bg-purple-600 border-purple-400 shadow-2xl scale-105 text-white z-20"
                  : "bg-black border-purple-700 text-white hover:scale-105 z-10 hover:border-purple-400"
              }
              `}
            style={{ flexBasis: "350px" }} // ensures all cards are exactly equal width
          >
            <div className="flex-1">
              <h3 className="text-xl font-semibold mb-2">{plan.name}</h3>
              <p className="text-2xl font-bold mb-4">${plan.price}</p>
              <span className="block mb-4">{plan.credits} credits</span>

              <ul className="space-y-2 mb-6">
                {plan.features?.map((feature, index) => (
                  <li key={index} className="flex items-center">
                    <span className="inline-block w-3 h-3 bg-purple-500 rounded-full mr-3"></span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
            <button className="mt-auto bg-purple-500 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition">
              Buy Now
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Credits;
