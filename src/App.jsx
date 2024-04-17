import { useState } from 'react';
import Month from './pages/month/index';
import styles from './App.module.scss';

const TYPE_MAP = {
  day: '日',
  week: '周',
  month: '月',
  year: '年',
};

function App() {
  const [type, setType] = useState('day');
  return (
    <div className={styles.App}>
      <div className={styles.changeType}>
        <div className={styles.changeTypeContent}>
          {
            Object.keys(TYPE_MAP).map((key) => (
              <div
                key={key}
                className={`${styles.typeItem} ${TYPE_MAP[key] === TYPE_MAP[type] ? styles.active : ''}`}
                onClick={() => setType(key)}
              >
                {TYPE_MAP[key]}
              </div>
            ))
          }
        </div>
      </div>
      <Month />
    </div>
  );
}

export default App;
