import Head from "next/head";
import styles from "@/styles/Home.module.css";
import React, { useState } from "react";
import Page1 from "./components/Page1";
import Page2 from "./components/Page2";

export default function Home() {
  const [stage, setStage] = useState<1 | 2>(1);
  const [selectedDrink, setSelectedDrink] = useState<string | null>(null);

  const handleSelectDrink = (drink: string) => {
    setSelectedDrink(drink);
    setStage(2);
  };

  return (
    <>
      <Head>
        <title>It's Great Day for Coffee</title>
        <meta name="description" content="Coffee menu UI" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className={styles.page} style={{ minHeight: "100vh", background: "#f8f5f2", display: "flex", flexDirection: "column", alignItems: "center" }}>
        {stage === 1 ? (
          <Page1 onNext={handleSelectDrink} />
        ) : (
          <Page2 onBack={() => setStage(1)} selectedDrink={selectedDrink} />
        )}
      </div>
    </>
  );
}
