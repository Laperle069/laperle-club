-- Applied to production after registration-mail latency was confirmed.
-- Keep quota, template, consent and delivery checks in the existing worker.
select cron.alter_job(jobid, schedule := '* * * * *')
from cron.job where jobname = 'laperle_mail';
