import styles from "@/Pages/ChatsPage/Chats.module.scss";

function UserStatus({isOnline, lastSeen}) {

  if (isOnline) {
    return <p className={styles.userstatus}>В мережі</p>;
  }

  const lastSeenStr = lastSeen;
  if (!lastSeenStr) {
    return <p className={styles.lastseen}>Давно не було(а)</p>;
  }
  const lastSeenDate = new Date(lastSeenStr);
  const now = new Date();
  const isToday =
    lastSeenDate.getFullYear() === now.getFullYear() &&
    lastSeenDate.getMonth() === now.getMonth() &&
    lastSeenDate.getDate() === now.getDate();
  const yesterday = new Date();
  yesterday.setDate(now.getDate() - 1);
  const isYesterday =
    lastSeenDate.getFullYear() === yesterday.getFullYear() &&
    lastSeenDate.getMonth() === yesterday.getMonth() &&
    lastSeenDate.getDate() === yesterday.getDate();
  const mins = lastSeenDate.getMinutes();
  const formattedMins = String(mins).padStart(2, '0');
  const hours = lastSeenDate.getHours();
  const formattedHours = String(hours).padStart(2, '0');
  const day = String(lastSeenDate.getDate()).padStart(2, '0')
  const month = String(lastSeenDate.getMonth() + 1).padStart(2, '0')

  if (isToday) {
    return <p className={styles.lastseen}>{`Сьогодні о ${formattedHours}:${formattedMins}`}</p>;
  } else if (isYesterday) {
    return <p className={styles.lastseen}>{`Вчора о ${formattedHours}:${formattedMins}`}</p>;
  } else {
    const year = lastSeenDate.getFullYear();

    return <p className={styles.lastseen}>{`${day}.${month}.${year}`}</p>
  }
}

export default UserStatus;