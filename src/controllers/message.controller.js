const Unauthorized = require('../errors/Unauthorized');
const Conversation = require('../models/conversation');
const Message = require('../models/message');
const Camping = require('../models/camping');
const HandledError = require('../errors/HandledError');
const messagesCtrl = {};

messagesCtrl.createConversation = async (req, res) => {
  // Crear una nueva conversación con los participantes dados
  const { type, id, camping } = req.body;
  const participants = [
    { type, id },
  ];

  if (camping) {
    const CampingObject = await Camping.findById(camping);
    if (!CampingObject.owner.equals(req.user._id)) {
      throw new Unauthorized();
    }
    participants.push({type: 'Camping', id: camping })
  } else {
    participants.push({ 
      type: 'User', 
      id: req.user.role !== 'admin' ? req.user._id : null 
    })
  }

  const prevConversation = await Conversation.findOne({
    $and: participants.map(p => ({ 'participants.id': p.id })),
  })

  if (prevConversation) {
    res.status(200).json(prevConversation);
    return;
  }

  const newConversation = new Conversation({ participants });
  await newConversation.save();

  res.status(201).json(newConversation);
};

messagesCtrl.getConversations = async (req, res, next) => {
  const { type, id, opts } = req.query;
  const { page, size, search, filters = {}, sort } = opts;
  const isAdmin = req.user.role === 'admin';

  try {
    if (type === 'Camping') {
      const CampingObject = await Camping.findById(id);
      console.log(CampingObject)
      if (!CampingObject.owner.equals(req.user._id)) {
        throw new Unauthorized();
      }
    } else if (id !== req.user._id && !isAdmin) {
      throw new Unauthorized();
    }

    filters['participants.id'] = id;

    const conversations = await Conversation.search(
      null, filters, size, page, sort, ['participants.id', 'lastMessage']
    );

    res.status(200).json(conversations);
  } catch (error) {
    console.log(error);
    next(error);
  }
};

messagesCtrl.getConversation = async (req, res, next) => {
  const { id } = req.params;
  const isAdmin = req.user.role === 'admin';

  const conversation = await Conversation.findById(id);

  if (!conversation.participants.find(p => p?.id?.equals(req.user._id)) && req.user.role !== 'admin') {
    throw new Unauthorized();
  }
  try {
    const messages = await Message.find({ conversation: id })
      .populate('sender') // Esto carga los detalles del remitente
      .sort('-createdAt'); // Ordena los mensajes por fecha de creación

    if (conversation.status !== 'pending') {
      conversation.lastMessageSeen.set(isAdmin ? 'admin' : req.user._id, new Date());
      conversation.save();
    }

    res.status(200).json({ conversation, messages });
  } catch (error) {
    console.log(error)
    next(error);
  }
};

messagesCtrl.sendMessage = async (req, res) => {
  const sender = req.user._id;
  const { subject, message } = req.body;
  const isAdmin = req.user.role === 'admin';

  try {
    const conversation = await Conversation.findById(req.params.id);
    const participant = conversation.participants.find(p => p.id && p.id.equals(sender));
    
    if (!participant && !isAdmin) {
      throw new Unauthorized();
    }

    if (conversation.status === 'pending') {
      if (!subject) {
        throw new HandledError('undefined_subject', 'Undefined subject');
      }
      conversation.subject = subject;
    }

    if (!message) {
      throw new HandledError('undefined_message', 'Undefined message');
    }
    const newMessage = new Message({ conversation, sender, message });
    await newMessage.save();

    // Actualizar la conversación con la fecha del último mensaje y del último mensaje visto
    conversation.lastMessage = newMessage._id;
    conversation.status = 'opened';
    conversation.lastMessageSeen.set(isAdmin ? 'admin' : sender, new Date());
    
    await conversation.save();
    await newMessage.populate('sender')
    res.status(201).json(newMessage);
  } catch (error) {
    console.log(error)
    next(error);
  }
};

module.exports = messagesCtrl;
