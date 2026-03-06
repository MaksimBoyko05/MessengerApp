import styles from "./GroupDetails.module.scss"
import {UserRoundPlus, X} from 'lucide-react';
import {ChevronLeft} from 'lucide-react';

function GroupDetails({details, setIsOpen}) {
  console.log(details)
  const members = details.members;
  console.log(members)
  const onClose = (e) => {
    e.stopPropagation();
    console.log("click")
    setIsOpen(false);
  }
  return (
    <>
      <div className={styles.groupdetailswrapper}>
        <div className={styles.detailscontainer}>
          <X
            className={styles.closebtn}
            size={24}
            onClick={onClose}/>
          <div className={styles.groupinfo}>
            <img
              alt={"groupimg"}
              src={"https://api.dicebear.com/9.x/glass/svg"}/>
            <p>{details.name}</p>
            <p>{members.length} Members</p>
          </div>
          <div className={styles.groupmembers}>
            <div>Add members <UserRoundPlus size={16}/></div>
            <div className={styles.innerDivider}></div>
            {members.map(members => (
              <div
                className={styles.memberslist}
                key={members.id}>
                <p className={styles.username}>{members.username}</p>
                <p className={styles.usersrole}>{members.role}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}

export default GroupDetails;