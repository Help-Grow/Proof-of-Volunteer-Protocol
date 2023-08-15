import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { client, challenge, authenticate } from "../../api/lens_api";
import styles from "@/styles/common.module.css";
import {
  Card,
  Result,
  Button,
  Space,
  Toast,
  Dialog,
  Form,
  Input,
  NoticeBar,
} from "antd-mobile";
import { useSetGlobalState, useGlobalState } from "@/hooks/globalContext";
import { LensClient, development } from "@lens-protocol/client";
import { useRouter } from "next/router";
import LocalStorageProvider from "../storage";
import { Web3Button, Web3NetworkSwitch } from "@web3modal/react";
import { useAccount, useSignMessage } from "wagmi";
import { WalletOptions } from "@/components/walletoptions";

export default function Home() {
  /* local state variables to hold user's address and access token */

  const [token, setToken] = useState<string>();
  // var { lensClient } = useGlobalState();
  const setGlobalState = useSetGlobalState();
  const router = useRouter();
  const { isConnected, address } = useAccount();
  const lensClient = new LensClient({
    environment: development,
    storage: new LocalStorageProvider(),
  });
  const { signMessageAsync } = useSignMessage();
  useEffect(() => {
    /* when the app loads, check to see if the user has already connected their wallet */
    async function checkLogin() {
      if (
        isConnected &&
        (await lensClient?.authentication?.isAuthenticated())
      ) {
        console.log("Already login");

        // router.push('/pomp_lens/profile');
      } else {
        console.log("didnt login");
      }
    }
    checkLogin();
  }, [lensClient?.authentication, router]);

  /////// this function didnt work
  useEffect(() => {
    if (token) {
      const res = Dialog.alert({
        content: "Login Success!",
        confirmText: "Got it",
        onConfirm: () => {
          router.push("/pomp_lens/profile");
        },
      });
    }
  }, [token, router]);

  // async function login() {
  //   try {
  //     /* first request the challenge from the API server */
  //     const challengeInfo = await client.query({
  //       query: challenge,
  //       variables: { address }
  //     })
  //     const provider = new ethers.providers.Web3Provider(window.ethereum);
  //     const signer = provider.getSigner()
  //     /* ask the user to sign a message with the challenge info returned from the server */
  //     const signature = await signer.signMessage(challengeInfo.data.challenge.text)
  //     /* authenticate the user */
  //     const authData = await client.mutate({
  //       mutation: authenticate,
  //       variables: {
  //         address, signature
  //       }
  //     })
  //     /* if user authentication is successful, you will receive an accessToken and refreshToken */
  //     const { data: { authenticate: { accessToken }}} = authData
  //     console.log({ accessToken })
  //     setToken(accessToken)
  //   } catch (err) {
  //     console.log('Error signing in: ', err)
  //   }
  // }
  async function login() {
    try {
      const challenge = await lensClient.authentication.generateChallenge(
        address?.toString()!
      );

      // const signature = await signer.signMessage(challenge);
      const signature = await signMessageAsync({
        message: challenge,
      });

      await lensClient.authentication.authenticate(
        address?.toString()!,
        signature?.toString()!
      );

      // check the state with
      if (await lensClient.authentication.isAuthenticated()) {
        // setGlobalState((pre) => ({ ...pre, lensClient }));
        setToken("Success");
        console.log("Success");
      }
    } catch (err) {
      console.log("Error signing in: ", err);
    }
  }
  return (
    <div className={styles.app}>
      <div className={styles.body}>
        <div style={{ textAlign: "center", margin: "32px 0px" }}>
          {/* <Web3Button icon="show" label="Connect Wallet" balance="show"></Web3Button> */}
          <WalletOptions />
          {/* if the user has connected their wallet but has not yet authenticated, show them a login button */}
          {isConnected && !token && (
            <div>
              <Button onClick={login}> Login</Button>
              <div onClick={() => router.push("/pomp_lens/signup")}>
                <Button>Signup</Button>
              </div>
            </div>
          )}
          {/* once the user has authenticated, show them a success message */}
          {address && token && <h2>Successfully signed in!</h2>}
        </div>
      </div>
    </div>
  );
}
