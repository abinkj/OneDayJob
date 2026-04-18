const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'app', '(tabs)', 'Home', 'index.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Insert socket listener useEffect right after the scrollToTop subscription effect
const ANCHOR = "    return () => subscription.remove();\n  }, []);";
const INSERT_AFTER = `\n\n  // Listen for arrival-approved socket event — auto-navigate worker to start timer
  useEffect(() => {
    const handleArrivalApproved = (data: any) => {
      const { jobId, jobName } = data || {};
      if (!jobId) return;
      Toast.show({
        type: 'success',
        text1: '✅ Employer Approved!',
        text2: 'Your arrival has been approved. The timer has started!',
        visibilityTime: 3000,
      });
      // Invalidate so the card switches to "verified" state
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      // Navigate directly to the timer
      navigation.navigate('JobTimer', {
        jobId,
        jobName: jobName || 'Job',
        isEmployer: false,
      });
    };

    const socket = (socketService as any)?.socket;
    if (socket) {
      socket.on('arrival-approved', handleArrivalApproved);
      return () => { socket.off('arrival-approved', handleArrivalApproved); };
    }
  }, [navigation, queryClient]);`;

const idx = content.indexOf(ANCHOR);
if (idx === -1) {
  console.log('Anchor not found — searching for alternative...');
  // Try CRLF version
  const ANCHOR2 = "    return () => subscription.remove();\r\n  }, []);";
  const idx2 = content.indexOf(ANCHOR2);
  if (idx2 !== -1) {
    content = content.slice(0, idx2 + ANCHOR2.length) + INSERT_AFTER + content.slice(idx2 + ANCHOR2.length);
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Socket listener inserted (CRLF variant)');
  } else {
    console.log('Could not insert — anchor not found in either LF or CRLF form');
  }
} else {
  content = content.slice(0, idx + ANCHOR.length) + INSERT_AFTER + content.slice(idx + ANCHOR.length);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Socket listener inserted successfully');
}
