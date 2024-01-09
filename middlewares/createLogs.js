import LogModel from '../model/log.model.js';

const logs = async (req, res, next) => {
  try {
    if (req.userId) {
      const send = res.send;
      res.send = (c) => {
        const protocol = req.protocol;
        const host = req.hostname;
        const url = req.originalUrl;
        // eslint-disable-next-line no-undef
        const port = process.env.PORT || 5000;
        const fullUrl = `${protocol}://${host}:${port}${url}`;
        const log_data = {
          user_id: req.userId,
          method: req.method,
          request_url: fullUrl,
          event_type: req.url,
          code: res.statusCode,
          response_data: JSON.stringify({ code: res.statusCode, body: c }),
          created_by: req.userId,
          created_at: new Date().toISOString(),
        };

        new LogModel(log_data).save();
        res.send = send;
        return res.send(c);
      };
    } else {
      console.log('Logs not created');
    }
    next();
  } catch (error) {
    console.log('error: ', error);
  }
};

export default logs;
