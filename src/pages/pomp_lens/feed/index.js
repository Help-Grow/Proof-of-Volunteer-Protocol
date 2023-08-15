import { useEffect, useMemo, useState } from "react";

import styles from "@/styles/common.module.css";
import { Card, Button, Image } from "antd-mobile";
import {
  LensClient,
  development,
  PublicationSortCriteria,
} from "@lens-protocol/client";
import { useRouter } from "next/router";
import LocalStorageProvider from "../storage";
import Link from "next/link";
import { useAccount, useSignTypedData } from "wagmi";
import { Connected } from "@/components/connected";

// 0x7ebd
export default function Home() {
  /* local state variables to hold user's address and access token */
  const [profile, setProfile] = useState();
  const [publications, setPublications] = useState();
  const [token, setToken] = useState();
  const { address, isConnected } = useAccount();
  const lensClient = useMemo(
    () =>
      new LensClient({
        environment: development,
        storage: new LocalStorageProvider(),
      }),
    []
  );
  const router = useRouter();

  const { data, isError, isLoading, isSuccess, signTypedDataAsync } =
    useSignTypedData();

  // async function fetchPublications() {
  //   fetchProfile();
  //   const result = await lensClient.profile.allFollowers({
  //     profileId: mainProfile,
  //   });

  //   var profileList = []
  //   for (var i =0;i<result.items.length;i++){
  //     profileList.push(result.items[i].wallet.defaultProfile.id)
  //   }
  //   console.log(profileList);
  //   const publications = await lensClient.publication.fetchAll({
  //     metadata: {
  //       locale: "en",

  //       mainContentFocus: [PublicationMainFocus.Image],
  //       tags: {
  //         oneOf: ["HelpAndGrow"],
  //       },
  //     },
  //     profileIds:profileList
  //   });

  //   setPublications(publications.items);
  //   console.log(publications.items)
  // }

  useEffect(() => {
    async function fetchProfile() {
      const allOwnedProfiles = await lensClient.profile.fetchAll({
        ownedBy: [address],
        limit: 1,
      });
      setProfile(allOwnedProfiles.items[0]); // cannot access profile directly for next step, it will return undefined
      return allOwnedProfiles.items[0];
    }

    async function fetchPublications() {
      fetchProfile();
      const publications = await lensClient.explore.publications({
        noRandomize: true,
        metadata: {
          tags: {
            oneOf: ["HelpAndGrow"],
          },
        },
        sortCriteria: PublicationSortCriteria.Latest,
      });

      setPublications(publications.items);
    }

    fetchPublications();
  }, [address, lensClient]);

  useEffect(() => {
    if (!isConnected) {
      router.push("/pomp_lens/login");
    }
  }, [isConnected, router]);

  async function collectPublication(id) {
    console.log("#######");
    console.log(id);
    const typedDataResult = await lensClient.publication.createCollectTypedData(
      {
        publicationId: id,
      }
    );
    // sign and broadcast the typed data
    const result = typedDataResult.unwrap();

    // sign with the wallet
    const d = result.typedData.domain;
    const dTmp = {
      chainId: d.chainId,
      name: d.name,

      verifyingContract: d.verifyingContract,
      version: d.version,
    };
    const sig = await signTypedDataAsync({
      domain: dTmp,
      types: result.typedData.types,
      value: result.typedData.value,
    });

    const broadcastResult = await lensClient.transaction.broadcast({
      id: data.id,
      signature: sig,
    });
    console.log(broadcastResult);
  }
  return (
    <div className={styles.app}>
      <div className={styles.body}>
        <Card>
          <Connected />
          {profile ? (
            <div className="pt-20">
              <div className="flex flex-col justify-center items-center">
                {/* <Image
                alt=""
                className="w-64 rounded-full"
                style={{ width: '16rem' }}
                src={profile.picture.original.url}
              /> */}
                <p className="text-4xl mt-8 mb-8">
                  Help and Grow Community Home
                </p>
                {/* <p className="text-center text-xl font-bold mt-2 mb-2 w-1/2">{profile.bio}</p> */}

                {publications ? (
                  publications.map((pub) => (
                    <div
                      key={pub.id}
                      className="shadow p-10 rounded mb-8 w-2/3"
                    >
                      <p>{pub.metadata.content}</p>
                      <Image
                        alt=""
                        src={pub.metadata.media[0].original.url}
                      ></Image>

                      <Button
                        style={{ float: "right" }}
                        onClick={() => collectPublication(pub.id)}
                        disabled={pub.profile.ownedBy == address}
                      >
                        Support Us
                      </Button>
                    </div>
                  ))
                ) : (
                  <p>Loading Publications</p>
                )}
                <Link href="/pomp_lens/post">
                  <Button block color="primary">
                    Post
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <p>Loading Profile</p>
          )}
          <Link href="/pomp_lens/profile">
            <Button block>Profile</Button>
          </Link>
        </Card>
        <div className="pt-20"></div>
      </div>
    </div>
  );
}
