package org.openmetadata.service.events;

import com.lmax.disruptor.EventHandler;
import com.lmax.disruptor.LifecycleAware;
import org.openmetadata.service.resources.events.EventResource.ChangeEventList;

public interface EventPublisherInterface extends EventHandler<EventPubSub.ChangeEventHolder>, LifecycleAware {

  void publish(ChangeEventList events) throws Exception;
}
