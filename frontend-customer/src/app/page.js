import Image from "next/image";
import styles from "./page.module.css";
import Login from '@/app/Login/page'

export default function Home() {
  return (
    <div className={styles.page}>
      <Login />
    </div>
  );
}
