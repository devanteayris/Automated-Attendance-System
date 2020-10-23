from django.db import models
import uuid
from django.core.files.storage import default_storage
import shutil
import os
# Create your models here.
def get_file_path(instance, filename) :
    ext = filename.split('.')[-1]
    filename = "%s.%s" % (uuid.uuid4(), ext)
    filedir = 'people/' + str(instance.uuid)
    return os.path.join(filedir, filename)


class Person(models.Model) :
    uuid = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    first_name = models.CharField(max_length=30)
    last_name = models.CharField(max_length=30)
    person_photo = models.ImageField(upload_to=get_file_path, null=True, blank=True)
    created_at = models.DateTimeField(auto_now=True)

    def __str__(self) :
        return str(self.pk) + ": " + self.first_name + " " + self.last_name

    def delete(self, using=None, keep_parents=False) :
        self.person_photo.storage.delete(self.person_photo.name)
        super().delete()




