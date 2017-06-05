import router from '../../router';

export default () => (
  {
    mount: () => {
      const latestRecordingID = '1030183816095-9085ceb6';
      // TODO fetch latest recording ID

      router.navigate(`/inbox/${latestRecordingID}`);
    },

    unmount: () => {},
  }
);
