<?php

class Klear_ErrorController extends Zend_Controller_Action
{

	public function init() {
		$this->_helper->ContextSwitch()
				->addActionContext('error', 'json')
				->initContext('json');
	}

	public function errorAction()
    {
        
        $errors = $this->_getParam('error_handler');
        
        
        if ($this->getInvokeArg('displayExceptions') == true) {
            $response = array('success' => false);
            // Add exception error message
	        $response['exception'] = $errors->exception->getMessage();

	        // Send stack trace
	        $response['trace'] = $errors->exception->getTrace();

	        // Send request params
	       //$response['request'] = $this->getRequest()->getParams();
	        $this->view->response = $response;
        }
        
        
        switch ($errors->type) {
            case Zend_Controller_Plugin_ErrorHandler::EXCEPTION_NO_ROUTE:
            case Zend_Controller_Plugin_ErrorHandler::EXCEPTION_NO_CONTROLLER:
            case Zend_Controller_Plugin_ErrorHandler::EXCEPTION_NO_ACTION:

                // 404 error -- controller or action not found
                $this->getResponse()->setHttpResponseCode(404);
                $this->view->message = 'Page not found';
                $this->view->code = 404;
                break;
            default:
                // application error
                $this->getResponse()->setHttpResponseCode(500);
                $this->view->message = 'Application error';
                $this->view->code = 500;
                break;
        }
        
        if (strtolower(get_class($errors->exception)) == "soapfault") {
            list(,$code) = explode(":",$errors->exception->faultcode);
            $this->view->code = $code;
            
        } else {
            
            $this->view->code  = $errors->exception->getCode();
        }
        
        $this->view->message = $errors->exception->getMessage();
        
    }
}
