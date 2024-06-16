import "./App.css";
import { TonConnectButton } from "@tonconnect/ui-react";
import { useMainContract } from "./hooks/useMainContract";
import { useTonConnect } from "./hooks/useTonConnect";

function App() {
  const { connected } = useTonConnect();
  //todo - change this
  const {
    contract_address,
    balance,
    sendCreateCampaign,
    withdrawCampaign,
  } = useMainContract();

  return (
    <div>
      <div>
        <TonConnectButton />
      </div>
      <div>
        <div className='Card'>
          <b>Our contract Address</b>
          <div className='Hint'>{contract_address}</div>
          <b>Our contract Balance</b>
          <div className='Hint'>{balance}</div>
        </div>

        <div className='Card'>
          <b>Counter Value</b>
          {/* todo - this as affiliate counter */}
          {/* <div>{counter_value ?? "Loading..."}</div> */}
        </div>

        {
          connected && (<> 
            <p onClick={sendCreateCampaign}> create campaign </p>
            <p onClick={withdrawCampaign}> get withdraw </p>
            </>)
        }
      </div>
    </div>
  );
}

export default App;