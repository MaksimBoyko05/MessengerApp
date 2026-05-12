import {useState} from "react";

function Filter({onSetFilterType}) {
  const [isActive, setActive] = useState('all');
  const handleClick = (type) => {
    onSetFilterType(type);
    setActive(type);
  }
  return (
    <>
      <div
        onClick={() => handleClick('all')}
        data-active={isActive === 'all'}>
        Всі
      </div>
      <div
        onClick={() => handleClick('unread')}
        data-active={isActive === 'unread'}>
        Непрочитані
      </div>
      <div
        onClick={() => handleClick('group')}
        data-active={isActive === 'group'}>
        Групи
      </div>
    </>
  )
}

export default Filter;