"use client";

const TradingPanelPreview = ({ className = "" }) => {
  return (
    <div
      className={`bg-white rounded-lg shadow-xl p-4 h-full w-full overflow-hidden ${className}`}
    >
      <div className="bg-gray-100 h-8 rounded-md mb-3 flex items-center px-3">
        <div className="flex space-x-2">
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
        </div>
        <div className="mx-auto text-sm text-gray-500">
          AbuBeast Trading Interface
        </div>
      </div>
      <div className="h-[calc(100%-2rem)] grid grid-cols-3 gap-3">
        <div className="col-span-2 bg-gray-50 rounded-md p-3">
          <div className="h-40 bg-white border border-gray-200 rounded-md overflow-hidden">
            {/* Trading chart placeholder */}
            <div className="w-full h-full bg-gradient-to-r from-blue-50 to-indigo-50 relative">
              <svg
                className="w-full h-full"
                viewBox="0 0 100 40"
                preserveAspectRatio="none"
              >
                <path
                  d="M0,35 L5,30 L10,32 L15,25 L20,28 L25,20 L30,22 L35,15 L40,18 L45,10 L50,12 L55,5 L60,8 L65,3 L70,6 L75,2 L80,4 L85,1 L90,5 L95,3 L100,5"
                  fill="none"
                  stroke="#4f46e5"
                  strokeWidth="0.5"
                />
              </svg>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 mt-3">
            <div className="bg-white border border-gray-200 rounded-md p-2">
              <div className="text-xs text-gray-500">Buy Order</div>
              <div className="grid grid-cols-3 gap-1 mt-1">
                <div className="bg-gray-100 p-1 rounded text-xs">Price</div>
                <div className="bg-gray-100 p-1 rounded text-xs">Amount</div>
                <div className="bg-gray-100 p-1 rounded text-xs">Total</div>
              </div>
            </div>
            <div className="bg-white border border-gray-200 rounded-md p-2">
              <div className="text-xs text-gray-500">Sell Order</div>
              <div className="grid grid-cols-3 gap-1 mt-1">
                <div className="bg-gray-100 p-1 rounded text-xs">Price</div>
                <div className="bg-gray-100 p-1 rounded text-xs">Amount</div>
                <div className="bg-gray-100 p-1 rounded text-xs">Total</div>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-gray-50 rounded-md p-3 flex flex-col">
          <div className="text-sm font-medium mb-2">Order Panel</div>
          <div className="bg-white border border-gray-200 rounded-md p-2 mb-2">
            <div className="flex justify-between mb-1">
              <span className="text-xs">Order Type</span>
            </div>
            <div className="flex space-x-1 mb-2">
              <div className="bg-blue-600 text-white text-xs py-1 px-2 rounded">
                Buy
              </div>
              <div className="bg-gray-100 text-gray-700 text-xs py-1 px-2 rounded">
                Sell
              </div>
            </div>
            <div className="space-y-2">
              <div className="bg-gray-50 p-1 rounded text-xs">Price</div>
              <div className="bg-gray-50 p-1 rounded text-xs">Amount</div>
              <div className="bg-blue-600 text-white text-center py-1 rounded text-xs">
                Place Order
              </div>
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded-md p-2 text-xs">
            <div className="font-medium mb-1">Balance</div>
            <div className="flex justify-between">
              <span>BTC:</span>
              <span>0.25</span>
            </div>
            <div className="flex justify-between">
              <span>USD:</span>
              <span>5,400.00</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TradingPanelPreview;
