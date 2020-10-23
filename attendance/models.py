from django.db import models
from users.models import Person
import uuid
from django.core.files.storage import default_storage
import shutil
import os
from app.storage_backends import PublicMediaStorage

def get_file_path(instance, filename) :
    ext = filename.split('.')[-1]
    filename = "%s.%s" % (uuid.uuid4(), ext)
    filedir = 'logs/' + str(instance.person.uuid)
    return os.path.join(filedir, filename)

# Create your models here.
class Attendance(models.Model) :
    created_at = models.DateTimeField(auto_now=True)
    person = models.ForeignKey(Person, on_delete=models.CASCADE)
    person_photo = models.ImageField(upload_to=get_file_path, null=True, blank=True)

    def __str__(self) :
        return str(self.created_at) + " " + self.person.__str__()
    
    def delete(self, using=None, keep_parents=False) :
        self.person_photo.storage.delete(self.person_photo.name)
        super().delete()