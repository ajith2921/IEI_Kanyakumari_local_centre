-- Enable the required extensions for cron jobs and HTTP requests
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- (If you ever need to stop this job, run: SELECT cron.unschedule('wakeup-render');)

-- Schedule a cron job to ping the Render backend every 14 minutes.
-- (Render free tier sleeps after 15 minutes of inactivity)
SELECT cron.schedule(
    'wakeup-render', -- name of the cron job
    '*/14 * * * *',  -- every 14 minutes
    $$
    SELECT net.http_get(
        url:='https://iei-kanyakumari-backend.onrender.com/api/health'
    );
    $$
);

-- Note: You can view the cron job status by querying:
-- SELECT * FROM cron.job;
-- SELECT * FROM cron.job_run_details ORDER BY start_time DESC LIMIT 10;
